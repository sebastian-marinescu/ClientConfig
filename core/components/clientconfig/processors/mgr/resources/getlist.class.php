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

        // Filter by Context if provided
        $context = $this->getProperty('context_key');
        if (!empty($context)) {
            $c->where(array('context_key' => $context));
        }

        // Filter by Parent and Depth if provided
        $parent = $this->getProperty('parent');
        if ($parent !== null && $parent !== '') {
            $parent = (int)$parent;
            $depth = (int)$this->getProperty('depth', 1);
            if ($depth > 1) {
                $childIds = $this->modx->getChildIds($parent, $depth, !empty($context) ? array('context' => $context) : array());
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
