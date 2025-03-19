// source: https://stackoverflow.com/a/6832721/1166642
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

ClientConfig.page.Home = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        id: 'clientconfig-page-home',
        renderTo: 'clientconfig-wrapper-div',
        border: false,
        components: [{
            cls: 'container',
            xtype: 'panel',
            items: [{
                html: '<h2>' + _('clientconfig') + '</h2>',
                border: false,
                cls: 'modx-page-header',
                id: 'clientconfig-header'
            }, {
                xtype: 'modx-formpanel',
                id: 'clientconfig-formpanel-home',
                cls: 'form-with-labels',
                layout: 'form',
                border: !!ClientConfig.config.verticalTabs && !MODx.config.connector_url,
                anchor: '100%',
                items: [{
                    xtype: 'hidden',
                    name: 'context'
                },{
                    xtype: (!!ClientConfig.config.verticalTabs) ? 'modx-vtabs' : 'modx-tabs',
                    border: false,
                    deferredRender: false,
                    defaults: {
                        border: false,
                        autoHeight: true,
                        defaults: {
                            border: false
                        }
                    },
                    items: this.getTabs(),
                    stateful: true,
                    id: 'clientconfig-page-home-tabs',
                    stateId: 'clientconfig-page-home',
                    stateEvents: ['tabchange'],
                    getState: function () {
                        return {
                            activeTab: this.items.indexOf(this.getActiveTab())
                        };
                    },
                    headerCfg: (ClientConfig.config.verticalTabs) ? {
                        tag: 'div',
                        cls: 'x-tab-panel-header vertical-tabs-header',
                        id: 'modx-resource-vtabs-header',
                        html: MODx.config.show_tv_categories_header == true ? '<h4 id="modx-resource-vtabs-header-title">' + _('clientconfig.categories') + '</h4>' : ''
                    } : undefined
                }]
            }]
        }],
        buttons: this.getButtons(),
        listeners: {
            afterrender: this.setup
        }
    });
    ClientConfig.page.Home.superclass.constructor.call(this,config);
};
Ext.extend(ClientConfig.page.Home,MODx.Component,{
    rtes: [],
    setup: function() {
        var rtes = this.rtes;
        setTimeout(function() {
            if (rtes.length > 0 && MODx.loadRTE) {
                Ext.each(rtes, function(id, index) {
                    MODx.loadRTE(id);
                });
            }

            if (ClientConfig.contextAware && ClientConfig.initialContext && ClientConfig.initialContext.key) {
                var contextSelector = Ext.getCmp('clientconfig-combo-contexts');
                contextSelector.setValue(ClientConfig.initialContext.key);
                contextSelector.fireEvent('select', contextSelector);
            }

            var hash = window.location.hash.substr(1);
            if (hash.length > 0) {
                var id = 'clientconfig-home-tab-' + hash,
                    tabPanel = Ext.getCmp('clientconfig-page-home-tabs');
                if (tabPanel && tabPanel.items.keys.indexOf(id) !== -1) {
                    tabPanel.setActiveTab(id);
                }
            }

        }, 150)
    },
    getTabs: function() {
        var tabs = [],
            rtes = [];

        Ext.each(ClientConfig.data, function(tabData) {
            var fields = [];
            Ext.iterate(tabData.items, function(value) {
                var field = {
                    name: value.key,
                    xtype: value.xtype,
                    fieldLabel: value.label + ((value.is_required) ? ClientConfig.reqAsterisk : ''),
                    value: (value.value !== '') ? value.value : value.default,
                    description: (ClientConfig.isAdmin) ? '<b>[[++' + value.key + ']]</b>' : undefined,
                    allowBlank: !value.is_required,
                    anchor: '60%',
                    id: 'clientconfig-' + value.key.replace('.','-')
                };

                if (['textarea', 'code'].indexOf(field.xtype) !== -1) {
                    field.anchor = '90%';
                    field.grow = true;
                    field.growMin = 150;
                    field.growMax = 800;
                }

                if (field.xtype === 'code') {
                    field.height = 150;
                    field.xtype = Ext.ComponentMgr.isRegistered('modx-texteditor') ? 'modx-texteditor' : 'textarea';
                }

                if (field.xtype === 'richtext') {
                    field.anchor = '90%';
                    field.xtype = 'textarea';
                    rtes.push(field.id);
                }

                if ((field.xtype === 'checkbox') || (field.xtype === 'xcheckbox')) {
                    field.boxLabel = field.fieldLabel;
                    field.fieldLabel = null;
                    field.value = 1;
                    field.checked = (value.value);
                }

		var hasRadioGroupCompatibleVersion = false,
		    minModx2RGVersion = "2.8.7",
		    minModx3RGVersion = "3.0.4";

		if (MODx && MODx.config && MODx.config.version) {
			var modxVersion = MODx.config.version.substring(0, MODx.config.version.length - 3),
			    modxVersionMajor = parseInt(modxVersion.substring(0, 1));

			if (modxVersionMajor === 2) {
				hasRadioGroupCompatibleVersion = versionCompare(modxVersion, minModx2RGVersion) !== -1;
			} else if (modxVersionMajor === 3) {
				hasRadioGroupCompatibleVersion = versionCompare(modxVersion, minModx3RGVersion) !== -1;
			} else if (modxVersionMajor > 3) {
				hasRadioGroupCompatibleVersion = true;
			}
		}

                if (((field.xtype === 'radiogroup') || (field.xtype === 'xradiogroup')) && hasRadioGroupCompatibleVersion) {
		    field.xtype = 'radiogroup';
		    field.columns = 4;
                    field.items = [];

                    var options = value.options.split('||');
                    Ext.each(options, function(option) {
                        option = option.split('==');
                        if (option[1]) {
                            field.items.push({
                                boxLabel: option[0],
                                inputValue: option[1],
                                checked: option[1] === field.value ? true : false,
                                name: field.name
                            })
                        } else {
                            field.items.push({
                                boxLabel: option[0],
                                inputValue: option[0],
                                checked: option[0] === field.value ? true : false,
                                name: field.name
                            })
                        }
                    });
                } else if ((field.xtype === 'radiogroup') || (field.xtype === 'xradiogroup')) {
                    field.xtype = 'radiogroup';

		    var extMC = new Ext.util.MixedCollection();

                    field.items = [{
		        boxLabel: 'Feature not available in your MODX-version, please update to at least version ' + (modxVersionMajor === 2 ? minModx2RGVersion : minModx3RGVersion),
                        inputValue: 0,
                        checked: true,
                        name: field.name
		    }];

		    extMC.addAll(field.items);
		    field.items = extMC;
		    field.items[0] = extMC.items;
		}

                if (field.xtype === 'datefield') {
                    field.format = MODx.config.manager_date_format;
                }

                if (field.xtype === 'timefield') {
                    field.format = MODx.config.manager_time_format;
                }

                if (['modx-panel-tv-image', 'modx-panel-tv-file'].indexOf(field.xtype) !== -1) {
                    field.tv = value.key;
                    field.source = value.source || MODx.config.default_media_source;
                    field.relativeValue = (value.value != '') ? value.value : value.default;
                    if (ClientConfig.isAdmin) {
                        field.listeners = {
                            render: function(fld) {
                                new Ext.ToolTip({
                                    target: fld.label.dom,
                                    html: field.description
                                });
                                new Ext.ToolTip({
                                    target: fld.getEl(),
                                    html: field.description
                                });
                            }
                        }
                    }
                }

                if (field.xtype === 'colorpickerfield') {
                    field.cls = 'x-colorpicker';
                }

                if (field.xtype === 'password') {
                    field.xtype = 'textfield';
                    field.inputType = 'password';
                }

                if (field.xtype === 'email') {
                    field.xtype = 'textfield';
                    field.vtype = 'email';
                }

                if (field.xtype === 'modx-combo') {
                    var options = value.options.split('||');
                    var data = [];
                    Ext.each(options, function(option, index) {
                        option = option.split('==');
                        if (option[1]) {
                            data.push([
                                option[1],
                                option[0]
                            ]);
                        } else {
                            data.push([option[0],option[0]]);
                        }
                    });

                    field.store = new Ext.data.ArrayStore({
                        mode: 'local',
                        fields: ['value','label'],
                        data: data
                    });
                    field.hiddenName = value.key;
                    field.valueField = 'value';
                    field.displayField = 'label';
                    field.mode = 'local';
                }

                // Remove all extra definitions for the line divider
                if (field.xtype === 'clientconfig-line') {
                    field = {
                        xtype: 'clientconfig-line'
                    }
                }

                fields.push(field);

                if (value.description && value.description.length > 0) {
                    var fieldDescription = {
                        xtype: 'label',
                        text: value.description,
                        cls: 'desc-under'
                    };
                    fields.push(fieldDescription);
                }
            });

            /* Only create the tab if there are fields in it. */
            if (fields.length >= 1) {
                var tab = {
                    id: 'clientconfig-home-tab-' + tabData.id,
                    title: tabData.label,
                    items: [],
                    cls: 'tvs-wrapper'
                };
                if (tabData.description !== '') {
                    tab.items.push({
                        bodyCssClass: 'panel-desc',
                        cls: ' ',
                        html: '<p>'+tabData.description+'</p>'
                    });
                }
                tab.items.push({
                    cls: 'main-wrapper',
                    items: fields,
                    xtype: 'panel',
                    layout: 'form',
                    labelAlign: 'top',
                    labelSeparator: '',
                    width: '85%'
                });
                tabs.push(tab);
            }
        });

        this.rtes = rtes;

        if (tabs.length < 1) {
            return [{
                title: _('clientconfig.no_configuration_yet'),
                items: [{
                    html: '<p>'+_('clientconfig.no_configuration_yet.desc')+'</p>',
                    bodyCssClass: 'panel-desc'
                }]
            }];
        }

        return tabs;
    },

    getButtons: function() {
        var buttons = [];

        if (ClientConfig.contextAware) {
            buttons.push('-',{
                xtype: 'panel',
                html: '<span style="padding-left: 1em; padding-right: 1em;">' + _('clientconfig.choose_context') + ': </span>'
            },{
                emptyText: _('clientconfig.choose_context'),
                xtype: 'clientconfig-combo-contexts',
                id: 'clientconfig-combo-contexts',
                listeners: {
                    change: {fn: this.switchContext, scope: this},
                    select: {fn: this.switchContext, scope: this}
                }
            });
        }

        buttons.push({
            text: _('clientconfig.save_config'),
            handler: this.save,
            cls: 'primary-button',
            scope: this,
            keys: [{
                key: MODx.config.keymap_save || 's',
                ctrl: true,
                fn: this.save
            }]
        });

        if (ClientConfig.isAdmin) {
            buttons.push('-',{
                text: '<i class="icon icon-cog"></i> ' + _('clientconfig.admin'),
                handler: this.openAdminPanel,
                scope: this
            })
        }

        return buttons;
    },

    switchContext: function(field) {
        var ctx = field.getValue(),
            fp = Ext.getCmp('clientconfig-formpanel-home'),
            heading = Ext.getCmp('clientconfig-header'),
            rtes = this.rtes;
        fp.el.mask(_('loading'));

        MODx.Ajax.request({
            url: ClientConfig.config.connectorUrl,
            params: {
                action: ctx.length > 0 ? 'mgr/settings/getcontextaware' : 'mgr/settings/getglobal',
                context: ctx
            },
            listeners: {
                success: {fn: function(r) {
                    var form = fp.getForm();
                    if (form) {
                        // Destroy RTEs before resetting and updating the form
                        ClientConfig.destroyRTEs(rtes);

                        // Set the new context-specific values
                        form.reset();
                        form.setValues(r.object);

                        // Re-initialize editors
                        if (MODx.loadRTE) {
                            Ext.each(rtes, function(id, index) {
                                MODx.loadRTE(id);
                            });
                        }
                    }
                    fp.el.unmask();
                    var headingText = r.object.context_name.length > 0
                        ? _('clientconfig.config_for_context', {context: r.object.context_name})
                        : _('clientconfig');
                    heading.update('<h2>' + headingText + '</h2>');
                }, scope: this},
                failure: {fn: function() {
                    fp.el.unmask();
                }, scope: this},
                scope: this
            }
        });
    },

    save: function() {
        var fp = Ext.getCmp('clientconfig-formpanel-home');
        if (fp && fp.getForm()) {
            var values = fp.getForm().getValues();

            // Fix name of image & file tv
            var imagePickers = fp.find('xtype', 'modx-panel-tv-image');
            Ext.each(imagePickers, function(imagePicker){
                values[imagePicker.name] = values['tv' + imagePicker.name];
            }, this);
            var filePickers = fp.find('xtype', 'modx-panel-tv-file');
            Ext.each(filePickers, function(filePicker){
                values[filePicker.name] = values['tv' + filePicker.name];
            }, this);

            fp.el.mask(_('saving'));
            MODx.Ajax.request({
                url: ClientConfig.config.connectorUrl,
                params: {
                    action: 'mgr/settings/save',
                    values: Ext.encode(values)
                },
                listeners: {
                    success: {fn: function(r) {
                        fp.el.unmask();
                        MODx.msg.status({
                            title: _('clientconfig.saved'),
                            message: _('clientconfig.saved.text'),
                            delay: 4
                        })
                    }, scope: this},
                    failure: {fn: function(r) {
                        fp.el.unmask();
                    }, scope: this},
                    scope: this
                }
            });
        }
    },

    openAdminPanel: function() {
        if (ClientConfig.isAdmin) {
            MODx.loadPage('?a=admin&namespace=clientconfig');
        }
    }
});
Ext.reg('clientconfig-page-home',ClientConfig.page.Home);
