<?php
/**
 * Gets a list of modResource objects for ClientConfig resource combo fields.
 *
 * @package ClientConfig
 */
use MODX\Revolution\Processors\Model\GetListProcessor;

// Use old 2.x version if not on MODX 3+
if (!class_exists(GetListProcessor::class)) {
    class cgResourcesGetListProcessor extends modObjectGetListProcessor {
        use cgResourcesGetListTrait;
    }
    return 'cgResourcesGetListProcessor';
}

// 3.x version
class cgResourcesGetListProcessor extends GetListProcessor {
    use cgResourcesGetListTrait;
}
return 'cgResourcesGetListProcessor';

/**
 * Common trait for both MODX 2 and MODX 3 versions of processor
 */
trait cgResourcesGetListTrait {
    public $classKey = 'modResource';
    public $languageTopics = array('resource');
    public $defaultSortField = 'pagetitle';
    public $defaultSortDirection = 'ASC';

    /**
     * @param xPDOQuery $c
     * @return xPDOQuery
     */
    public function prepareQueryBeforeCount(xPDOQuery $c) {
        $c->select($this->modx->getSelectColumns('modResource', 'modResource', '', array('id', 'pagetitle', 'context_key', 'parent')));
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
                'pagetitle:LIKE' => '%' . $query . '%',
                'OR:longtitle:LIKE' => '%' . $query . '%',
                'OR:id:=' => $query,
            ));
        }

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
}
