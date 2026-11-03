<?php
/**
 * Gets a list of modResource objects for ClientConfig resource combo fields.
 *
 * @package ClientConfig
 */
class cgResourcesGetListProcessor extends modObjectGetListProcessor {
    public $classKey = 'modResource';
    public $defaultSortField = 'pagetitle';
    public $defaultSortDirection = 'ASC';
    public $checkListPermission = false;

    /**
     * @param xPDOQuery $c
     * @return xPDOQuery
     */
    public function prepareQueryBeforeCount(xPDOQuery $c) {
        $c->where(array(
            'deleted' => 0,
        ));

        // Filter / Exclude Context(s) if provided
        $context = $this->getProperty('context_key');
        $excludeContext = $this->getProperty('exclude_context');
        if (empty($excludeContext)) {
            $excludeContext = $this->getProperty('exclude_contexts');
        }
        if (empty($excludeContext)) {
            $excludeContext = $this->getProperty('exclude');
        }

        $includeContexts = array();
        $excludeContexts = array();

        if (!empty($excludeContext)) {
            if (is_string($excludeContext)) {
                $excludeContexts = array_merge($excludeContexts, preg_split('/[,|]/', $excludeContext));
            } elseif (is_array($excludeContext)) {
                $excludeContexts = array_merge($excludeContexts, $excludeContext);
            } else {
                $excludeContexts[] = (string)$excludeContext;
            }
        }

        if (!empty($context)) {
            $rawContexts = is_array($context) ? $context : preg_split('/[,|]/', (string)$context);
            foreach ($rawContexts as $ctx) {
                $ctx = trim($ctx);
                if ($ctx === '' || $ctx === '*' || strtolower($ctx) === 'all') {
                    continue;
                }
                if ($ctx[0] === '-' || $ctx[0] === '!') {
                    $excludeContexts[] = substr($ctx, 1);
                } else {
                    $includeContexts[] = $ctx;
                }
            }
        }

        $excludeContexts = array_values(array_unique(array_filter(array_map('trim', $excludeContexts))));
        $includeContexts = array_values(array_unique(array_filter(array_map('trim', $includeContexts))));

        if (!empty($includeContexts)) {
            if (count($includeContexts) === 1) {
                $c->where(array('context_key' => reset($includeContexts)));
            } else {
                $c->where(array('context_key:IN' => $includeContexts));
            }
        }

        if (!empty($excludeContexts)) {
            if (count($excludeContexts) === 1) {
                $c->where(array('context_key:!=' => reset($excludeContexts)));
            } else {
                $c->where(array('context_key:NOT IN' => $excludeContexts));
            }
        }

        // Filter by Parent and Depth if provided
        $parent = $this->getProperty('parent');
        if ($parent !== null && $parent !== '') {
            $parent = (int)$parent;
            $depth = (int)$this->getProperty('depth', 1);
            if ($depth > 1) {
                $childIds = $this->modx->getChildIds($parent, $depth, !empty($includeContexts) && count($includeContexts) === 1 ? array('context' => reset($includeContexts)) : array());
                if (!empty($childIds)) {
                    $c->where(array('id:IN' => $childIds));
                } else {
                    $c->where(array('id' => -1));
                }
            } else {
                $c->where(array('parent' => $parent));
            }
        }

        // Filter by Search Query
        $query = $this->getProperty('query');
        if (!empty($query)) {
            $c->where(array(
                array(
                    'pagetitle:LIKE' => '%' . $query . '%',
                    'OR:longtitle:LIKE' => '%' . $query . '%',
                    'OR:id:=' => $query,
                )
            ));
        }

        return $c;
    }

    /**
     * @param xPDOQuery $c
     * @return xPDOQuery
     */
    public function prepareQueryAfterCount(xPDOQuery $c) {
        $c->select($this->modx->getSelectColumns('modResource', 'modResource', '', array('id', 'pagetitle', 'context_key', 'parent')));
        $c->sortby('context_key', 'ASC');
        $c->sortby('pagetitle', 'ASC');
        return $c;
    }

    /**
     * Transform the xPDOObject derivative to an array
     * @param xPDOObject $object
     * @return array
     */
    public function prepareRow(xPDOObject $object) {
        return array(
            'id' => (int)$object->get('id'),
            'pagetitle' => $object->get('pagetitle'),
            'context_key' => $object->get('context_key'),
        );
    }

    /**
     * Return JSON in the format expected by MODx.combo.ComboBox
     * @param array $list
     * @param int|null $total
     * @return string
     */
    public function outputArray(array $list, $total = null) {
        $total = $total !== null ? $total : count($list);
        return $this->modx->toJSON(array(
            'success' => true,
            'total' => (int)$total,
            'results' => $list,
        ));
    }
}
return 'cgResourcesGetListProcessor';
