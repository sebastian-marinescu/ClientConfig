ClientConfig.combo.Groups = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        url: ClientConfig.config.connectorUrl,
        baseParams: {
            action: 'mgr/groups/getlist',
            combo: true
        },
        fields: ['id','label'],
        hiddenName: config.name || 'group',
        pageSize: 15,
        valueField: 'id',
        displayField: 'label'
    });
    ClientConfig.combo.Groups.superclass.constructor.call(this,config);

    if (config.storeLoadListener) {
        this.store.on('load', config.storeLoadListener, this);
        this.on('render', function() {
            if (!this.getValue()) {
                this.store.load();
            }
        });
    }
};
Ext.extend(ClientConfig.combo.Groups,MODx.combo.ComboBox);
Ext.reg('clientconfig-combo-groups',ClientConfig.combo.Groups);


ClientConfig.combo.FieldTypes = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        store: new Ext.data.ArrayStore({
            mode: 'local',
            fields: ['xtype','label'],
            data: [
                ['textfield', _('clientconfig.xtype.textfield')],
                ['textarea', _('clientconfig.xtype.textarea')],
                ['richtext', _('clientconfig.xtype.richtext')],
                ['code', _('clientconfig.xtype.code')],
                ['modx-panel-tv-image', _('clientconfig.xtype.image')],
                ['modx-panel-tv-file', _('clientconfig.xtype.file')],
                ['numberfield', _('clientconfig.xtype.numberfield')],
                ['colorpickerfield', _('clientconfig.xtype.colorpalette')],
                ['email', _('clientconfig.xtype.email')],
                ['url', _('clientconfig.xtype.url')],
                ['tel', _('clientconfig.xtype.tel')],
                ['xradiogroup', _('clientconfig.xtype.radiogroup')],
                ['multi-checkbox', _('clientconfig.xtype.multi-checkbox')],
                ['xcheckbox', _('clientconfig.xtype.xcheckbox')],
                ['datefield', _('clientconfig.xtype.datefield')],
                ['timefield', _('clientconfig.xtype.timefield')],
                ['password', _('clientconfig.xtype.password')],
                ['disabled', _('clientconfig.xtype.disabled')],
                ['modx-combo', _('clientconfig.xtype.combobox')],
                ['modx-combo-resource', _('clientconfig.xtype.resource')],
                ['googlefontlist', _('clientconfig.xtype.googlefonts')],
                ['clientconfig-line', _('clientconfig.xtype.line')],
                ['clientconfig-heading', _('clientconfig.xtype.heading')],
                ['clientconfig-desc', _('clientconfig.xtype.desc')],
                ['clientconfig-alert', _('clientconfig.xtype.alert')]
            ]
        }),
        hiddenName: config.name || 'xtype',
        valueField: 'xtype',
        displayField: 'label',
        mode: 'local',
        value: 'textfield'
    });

    if (MODx.config['clientconfig.google_fonts_api_key'] == '')  config.store.removeAt(config.store.find('xtype','googlefontlist'));
    ClientConfig.combo.FieldTypes.superclass.constructor.call(this,config);
};
Ext.extend(ClientConfig.combo.FieldTypes,MODx.combo.ComboBox);
Ext.reg('clientconfig-combo-fieldtypes',ClientConfig.combo.FieldTypes);

ClientConfig.combo.GoogleFontList = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        url: ClientConfig.config.connectorUrl,
        baseParams: {
            action: 'mgr/fonts/google/getList',
            combo: true
        },
        fields: ['family','name'],
        hiddenName: config.name || 'font',
        valueField: 'family',
        displayField: 'name'
    });
    ClientConfig.combo.GoogleFontList.superclass.constructor.call(this,config);
};
Ext.extend(ClientConfig.combo.GoogleFontList, MODx.combo.ComboBox);
Ext.reg('googlefontlist',ClientConfig.combo.GoogleFontList);

ClientConfig.combo.ContextList = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        url: ClientConfig.config.connectorUrl,
        baseParams: {
            action: 'mgr/contexts/getlist',
            exclude: 'mgr',
            combo: true,
            sort: '`rank`',
        },
        fields: ['key','name'],
        hiddenName: config.name || 'context',
        valueField: 'key',
        displayField: 'name',
        pageSize: 20
        // Typeahead prevents the dropdown from opening on click, needs a solution first
        // editable: true,
        // typeahead: true,
        // forceSelection: true,
        // queryParam: 'search',
    });
    ClientConfig.combo.ContextList.superclass.constructor.call(this,config);
};
Ext.extend(ClientConfig.combo.ContextList, MODx.combo.ComboBox);
Ext.reg('clientconfig-combo-contexts',ClientConfig.combo.ContextList);

ClientConfig.combo.Resource = function(config) {
    config = config || {};
    Ext.applyIf(config, {
        url: config.url || ClientConfig.config.connectorUrl,
        baseParams: {
            action: 'mgr/resources/getlist',
            combo: true
        },
        cls: 'x-form-twin-trigger-input',
        fields: ['id', 'pagetitle', 'context_key'],
        displayField: 'pagetitle',
        valueField: 'id',
        hiddenName: config.name || 'resource',
        pageSize: 20,
        typeAhead: true,
        editable: true,
        forceSelection: true,
        minChars: 1,
        triggerAction: 'all',
        trigger1Class: 'x-form-clear-trigger',
        trigger2Class: 'x-form-arrow-trigger',
        emptyText: _('clientconfig.select_resource') || _('resource'),
        tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="x-combo-list-item" style="padding: 5px 8px; line-height: 1.4;">',
                    '<tpl if="context_key">',
                        '<span style="display: inline-block; min-width: 48px; text-align: center; color: #555; font-size: 10px; font-weight: bold; background: #e8e8e8; padding: 1px 5px; border-radius: 3px; margin-right: 8px; vertical-align: middle;">[{context_key}]</span>',
                    '</tpl>',
                    '<span style="vertical-align: middle;"><b>{pagetitle}</b> <small style="color: #888;">({id})</small></span>',
                '</div>',
            '</tpl>'
        )
    });
    ClientConfig.combo.Resource.superclass.constructor.call(this, config);
};
Ext.extend(ClientConfig.combo.Resource, MODx.combo.ComboBox, {
    trigger1Class: 'x-form-clear-trigger',
    trigger2Class: 'x-form-arrow-trigger',

    initComponent: function() {
        this.triggerConfig = {
            tag: 'span',
            cls: 'x-form-twin-triggers',
            cn: [
                {tag: 'div', cls: 'x-form-trigger ' + this.trigger1Class},
                {tag: 'div', cls: 'x-form-trigger ' + this.trigger2Class}
            ]
        };
        ClientConfig.combo.Resource.superclass.initComponent.call(this);
    },

    initTrigger: function() {
        var ts = this.trigger.select('.x-form-trigger', true);
        this.wrap.setStyle('overflow', 'hidden');
        var triggerField = this;
        ts.each(function(t, all, index) {
            t.hide = function() {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w - triggerField.getTriggerWidth());
            };
            t.show = function() {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w - triggerField.getTriggerWidth());
            };
            var triggerIndex = 'Trigger' + (index + 1);

            if (this['hide' + triggerIndex]) {
                t.dom.style.display = 'none';
            }
            t.on('click', this['on' + triggerIndex + 'Click'], this, {preventDefault: true});
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;
        if (this.triggers && this.triggers[0]) {
            this.triggers[0].dom.title = _('clientconfig.clear') || 'Clear';
        }
    },

    getTriggerWidth: function() {
        var tw = 0;
        Ext.each(this.triggers, function(t, index) {
            var triggerIndex = 'Trigger' + (index + 1),
                w = t.getWidth();
            if (w === 0 && !this['hide' + triggerIndex]) {
                tw += this.defaultTriggerWidth || 17;
            } else {
                tw += w;
            }
        }, this);
        return tw;
    },

    onDestroy: function() {
        Ext.destroy(this.triggers);
        ClientConfig.combo.Resource.superclass.onDestroy.call(this);
    },

    onTrigger1Click: function() {
        this.clearValue();
        if (this.hiddenField) {
            this.hiddenField.value = '';
        }
        this.value = '';
        this.fireEvent('clear', this);
        this.fireEvent('change', this, '', this.startValue);
    },

    onTrigger2Click: function() {
        this.onTriggerClick();
    },

    beforeBlur: function() {
        var val = this.getRawValue();
        if (val === '') {
            this.clearValue();
        }
        ClientConfig.combo.Resource.superclass.beforeBlur.call(this);
    },

    setValue: function(val) {
        if (!val || val === '0' || val === 0) {
            this.clearValue();
            return this;
        }
        ClientConfig.combo.Resource.superclass.setValue.call(this, val);
        if (val && !isNaN(val)) {
            var rec = this.findRecord(this.valueField, val);
            if (rec) {
                var ctx = rec.get('context_key');
                var prefix = ctx ? '[' + ctx + '] ' : '';
                this.setRawValue(prefix + rec.get(this.displayField) + ' (' + rec.get(this.valueField) + ')');
            } else {
                MODx.Ajax.request({
                    url: MODx.config.connector_url,
                    params: {
                        action: 'resource/get',
                        id: val
                    },
                    listeners: {
                        success: {
                            fn: function(r) {
                                if (r.object && r.object.pagetitle) {
                                    var ctx = r.object.context_key;
                                    var prefix = ctx ? '[' + ctx + '] ' : '';
                                    this.setRawValue(prefix + r.object.pagetitle + ' (' + r.object.id + ')');
                                }
                            },
                            scope: this
                        }
                    }
                });
            }
        }
        return this;
    }
});
Ext.reg('clientconfig-combo-resource', ClientConfig.combo.Resource);
Ext.reg('modx-combo-resource', ClientConfig.combo.Resource);


ClientConfig.ux.Line = Ext.extend(Ext.Component, {
    autoEl: 'hr'
});
Ext.reg('clientconfig-line', ClientConfig.ux.Line);

ClientConfig.ux.Desc = Ext.extend(Ext.BoxComponent, {
    autoEl: {
        tag: 'div',
        cls: 'clientconfig-desc-panel panel-desc'
    }
});
Ext.reg('clientconfig-desc', ClientConfig.ux.Desc);

ClientConfig.ux.Heading = Ext.extend(Ext.BoxComponent, {
    autoEl: {
        tag: 'div',
        cls: 'clientconfig-heading-wrapper'
    }
});
Ext.reg('clientconfig-heading', ClientConfig.ux.Heading);

ClientConfig.ux.Alert = Ext.extend(Ext.BoxComponent, {
    autoEl: {
        tag: 'div',
        cls: 'clientconfig-alert-panel panel-desc'
    }
});
Ext.reg('clientconfig-alert', ClientConfig.ux.Alert);
