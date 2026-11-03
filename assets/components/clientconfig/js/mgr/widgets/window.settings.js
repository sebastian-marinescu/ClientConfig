ClientConfig.window.Setting = function(config) {
    config = config || {};
    config.id = config.id || Ext.id();

    var toggleField = function(fld, show) {
        if (!fld) return;
        fld.setVisible(show);
        if (fld.getItemCt) {
            var itemCt = fld.getItemCt();
            if (itemCt) {
                itemCt.setDisplayed(show);
            }
        }
        if (fld.getEl && fld.getEl()) {
            var wrap = fld.getEl().up('.x-form-item');
            if (wrap) {
                wrap.setDisplayed(show);
            }
        }
    };

    var updateFieldVisibility = function(xtype) {
        var hasOptions = ['modx-combo', 'radiogroup', 'xradiogroup', 'multi-checkbox', 'checkboxgroup', 'modx-combo-resource', 'resource'].indexOf(xtype) !== -1;
        toggleField(Ext.getCmp(config.id + '-options'), hasOptions);
        toggleField(Ext.getCmp(config.id + '-process_options'), hasOptions);

        var isHeading = ['clientconfig-heading', 'heading'].indexOf(xtype) !== -1;
        toggleField(Ext.getCmp(config.id + '-heading-divider'), isHeading);

        var hasSource = ['modx-panel-tv-image', 'modx-panel-tv-file'].indexOf(xtype) !== -1;
        toggleField(Ext.getCmp(config.id + '-source'), hasSource);

        var isLayout = ['clientconfig-line', 'clientconfig-desc', 'clientconfig-info', 'information', 'description', 'clientconfig-heading', 'heading', 'clientconfig-alert', 'alert', 'disabled', 'readonly'].indexOf(xtype) !== -1;
        toggleField(Ext.getCmp(config.id + '-is_required'), !isLayout);

        var isLine = (xtype === 'clientconfig-line');
        toggleField(Ext.getCmp(config.id + '-value'), !isLine);
    };

    Ext.applyIf(config, {
        title: (config.isUpdate) ?
            _('clientconfig.update_setting') :
            (config.isDuplicate) ? _('clientconfig.duplicate_setting') : _('clientconfig.add_setting'),
        autoHeight: true,
        url: ClientConfig.config.connectorUrl,
        baseParams: {
            action: (config.isUpdate) ?
                'mgr/settings/update' :
                'mgr/settings/create'
        },
        width: 750,
        fields: [{
            xtype: 'hidden',
            name: 'id'
        },{
            layout: 'column',
            items: [{
                columnWidth: 0.5,
                layout: 'form',
                items: [{
                    xtype: 'textfield',
                    name: 'key',
                    fieldLabel: _('clientconfig.key') + ClientConfig.reqAsterisk,
                    allowBlank: false,
                    anchor: '100%'
                },{
                    xtype: 'textfield',
                    name: 'label',
                    fieldLabel: _('clientconfig.label') + ClientConfig.reqAsterisk,
                    allowBlank: false,
                    anchor: '100%'
                },{
                    xtype: 'textarea',
                    name: 'description',
                    fieldLabel: _('clientconfig.description'),
                    anchor: '100%'
                },{
                    xtype: 'clientconfig-combo-groups',
                    name: 'group',
                    fieldLabel: _('clientconfig.group'),
                    anchor: '100%',
                    autoLoad: true,
                    storeLoadListener: function(store, data, request) {
                        if (this.getValue() < 1) {
                            this.setValue(store.getAt(0).get(this.valueField));
                        }
                        return true;
                    }
                },{
                    xtype: 'numberfield',
                    name: 'sortorder',
                    fieldLabel: _('clientconfig.sortorder'),
                    allowBlank: false,
                    minValue: 0,
                    maxValue: 9999999999,
                    anchor: '100%',
                    value: 0
                }]
            },{
                columnWidth: 0.5,
                layout: 'form',
                layoutConfig: {
                    trackLabels: true
                },
                items: [{
                    xtype: 'clientconfig-combo-fieldtypes',
                    name: 'xtype',
                    fieldLabel: _('clientconfig.xtype') + ClientConfig.reqAsterisk,
                    allowBlank: false,
                    anchor: '100%',
                    listeners: {
                        select: {fn: function(field, record) {
                            updateFieldVisibility(record.data.xtype);
                        }, scope: this}
                    }
                },{
                    xtype: (config.record && config.record.xtype && ['textarea', 'richtext', 'clientconfig-desc', 'clientconfig-info', 'information', 'description', 'clientconfig-alert', 'alert'].indexOf(config.record.xtype) !== -1) ? 'textarea' : 'textfield',
                    id: config.id + '-value',
                    name: 'value',
                    fieldLabel: _('clientconfig.value'),
                    anchor: '100%',
                    height: (config.record && config.record.xtype && ['clientconfig-desc', 'clientconfig-info', 'information', 'description', 'clientconfig-alert', 'alert'].indexOf(config.record.xtype) !== -1) ? 120 : undefined
                },{
                    xtype: 'textarea',
                    id: config.id + '-options',
                    name: 'options',
                    fieldLabel: _('clientconfig.options'),
                    description: _('clientconfig.options.desc'),
                    anchor: '100%'
                },{
                    xtype: 'checkbox',
                    id: config.id + '-process_options',
                    name: 'process_options',
                    boxLabel: _('clientconfig.process_options'),
                    anchor: '100%'
                },{
                    xtype: 'checkbox',
                    id: config.id + '-heading-divider',
                    name: 'heading_divider',
                    boxLabel: _('clientconfig.heading_divider') || 'Trennlinie unter Überschrift anzeigen',
                    checked: (!config.record || !config.record.options || (config.record.options.indexOf('line=0') === -1 && config.record.options.indexOf('noline') === -1 && config.record.options !== '0')),
                    anchor: '100%'
                },{
                    xtype: 'modx-combo-source',
                    id: config.id + '-source',
                    name: 'source',
                    fieldLabel: _('clientconfig.source'),
                    description: _('clientconfig.source.desc'),
                    anchor: '100%',
                    hideMode: 'offsets',
                    value: 0
                },{
                    xtype: 'checkbox',
                    id: config.id + '-is_required',
                    name: 'is_required',
                    boxLabel: _('clientconfig.is_required.long'),
                    anchor: '100%'
                }]
            }]
        }],
        keys: [], //prevent enter in textarea from firing submit
        buttons: [{
            text: _('cancel'),
            scope: this,
            handler: function() { this.hide(); }
        },'-',{
            text: _('save'),
            scope: this,
            handler: function () {
                this.submit(false);
            },
            cls: 'primary-button'
        }, {
            text: _('save_and_close'),
            scope: this,
            handler: this.submit,
            cls: 'primary-button'
        }]
    });
    ClientConfig.window.Setting.superclass.constructor.call(this,config);

    this.on('afterrender', function() {
        var xtypeField = this.find('name', 'xtype')[0];
        var initialXtype = (config.record && config.record.xtype) ? config.record.xtype : (xtypeField ? xtypeField.getValue() : 'textfield');
        updateFieldVisibility(initialXtype);
    }, this);

    this.on('beforeSubmit', function(values) {
        var curXtype = values.xtype;
        if (['clientconfig-heading', 'heading'].indexOf(curXtype) !== -1) {
            var divCmp = Ext.getCmp(config.id + '-heading-divider');
            var optCmp = Ext.getCmp(config.id + '-options');
            if (divCmp && optCmp) {
                optCmp.setValue(divCmp.getValue() ? 'line=1' : 'line=0');
            }
        }
        return true;
    }, this);
};
Ext.extend(ClientConfig.window.Setting,MODx.Window);
Ext.reg('clientconfig-window-setting',ClientConfig.window.Setting);
