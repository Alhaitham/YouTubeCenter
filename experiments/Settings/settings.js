﻿/*** module settings.js
 * This will replace the old settings when it's finished.
 * The settings will be put into a dialog as the experimental dialog is at the moment.
 * ********************************************************************************************
 * The settings will include categories and from the categories to subcategories, where the subcateogories will contain the options.
 * It will be possible for YouTube Center to hide or disable specific categories/subcategories/options if needed.
 * ********************************************************************************************
 * The categories will be placed to the left side as the guide is on YouTube. The categories will use the same red design as the guide.
 * The subcategories will be the same as the categories in the old settings.
 * The options will be much more customizeable, where you will be able to add modules.
 ***/
/** Option  It should be easy to add new options.
 * The option will contain a label if the label is specified otherwise it will not be added.
 * The "defaultSetting" will be available as it currently is.
 * The "args" will be added, which will be a way to pass more arguments to the module (if needed or required).
 * The "type" will be replaced with "module", which will be a function with the prefix "ytcenter.modules.*".
 * The "help" will still be present in this version.
 * Everything is optional except for the type, which is needed to add the option to the settings.
 **/
/** Module  Handles the option like what happens when I click on that checkbox or input some text in a textfield...
 * When the module (function) is called. It need to have the following arguments passed:
 ** defaultSetting  Needs the defaultSetting to set the default settings.
 * The module needs to return an object with:
 ** element An element, which will be added to the settings.
 ** bind  A function, where a callback function is passed. When an update which requires YouTube Center to save settings this callback function is called.
 ** update  A function, which will be called whenever a value needs to be changed in the module. In an instance where the settings has changed and the module needs to update with the changes.
 **/

/***** Module part *****/

/**** Settings part ****/
ytcenter.settingsPanel = (function(){
  var a = {}, categories = [], subcategories = [], options = [];
  
  a.createCategory = function(label){
    var id = categories.length;
    categories.push({
      id: id,
      label: label,
      enabled: true,
      visible: true,
      subcategories: []
    });
    return a.getCategory(id);
  };
  a.createSubCategory = function(label){
    var id = subcategories.length;
    subcategories.push({
      id: id,
      label: label,
      enabled: true,
      visible: true,
      options: []
    });
    return a.getSubCategory(id);
  };
  a.createOption = function(defaultSetting, module, label, args, help){
    var id = options.length;
    options.push({
      id: id,
      label: label,
      args: args,
      defaultSetting: defaultSetting,
      module: module,
      help: help,
      enabled: true,
      visible: true,
      style: {},
      listeners: {}
    });
    return a.getOption(id);
  };
  a.getCategory = function(id){
    if (categories.length <= id || id < 0) throw new Error("[Settings Category] Category with specified id doesn't exist (" + id + ")!");
    var cat = categories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        cat.visible = visible;
      },
      setEnabled: function(enabled){
        cat.enabled = enabled;
      },
      addSubCategory: function(subcategory){
        cat.subcategories.push(subcategories[subcategory.getId()]);
      },
      select: function(){
        if (cat.select) cat.select();
      }
    };
  };
  a.getSubCategory = function(id){
    if (subcategories.length <= id || id < 0) throw new Error("[Settings SubCategory] Category with specified id doesn't exist (" + id + ")!");
    var subcat = subcategories[id];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        subcat.visible = visible;
      },
      setEnabled: function(enabled){
        subcat.enabled = enabled;
      },
      addOption: function(option){
        subcat.options.push(options[option.getId()]);
      },
      select: function(){
        if (cat.select) cat.select();
      }
    };
  };
  a.getOption = function(id){
    if (options.length <= id || id < 0) throw new Error("[Settings Options] Option with specified id doesn't exist (" + id + ")!");
    var option = options[id];
    return {
      getId: function(){
        return id;
      },
      getLabel: function(){
        return option.label;
      },
      getDefaultSetting: function(){
        return option.defaultSetting;
      },
      getModule: function(){
        return option.module;
      },
      getHelp: function(){
        return option.help;
      },
      setVisibility: function(visible){
        option.visible = visible;
      },
      setEnabled: function(enabled){
        option.enabled = enabled;
      },
      setStyle: function(key, value){
        option.style[key] = value;
      },
      getStyle: function(key){
        return option.style[key];
      },
      addEventListener: function(event, callback){
        if (!option.listeners) option.listeners = {};
        if (!option.listeners[event]) option.listeners[event] = [];
        option.listeners[event].push(callback);
      },
      removeEventListener: function(event, callback){
        if (!option.listeners) return;
        if (!option.listeners[event]) return;
        var i;
        for (i = 0; i < option.listeners[event].length; i++) {
          if (option.listeners[event][i] === callback) {
            option.listeners[event].splice(i, 1);
            return;
          }
        }
      }
    };
  };
  a.createOptionsForLayout = function(subcat){
    var frag = document.createDocumentFragment();
    
    subcat.options.forEach(function(option){
      var optionWrapper = document.createElement("div"),
          label, module, moduleContainer, labelText, help, replaceHelp, i;
      if (option.label && option.label !== "") {
        labelText = document.createTextNode(ytcenter.language.getLocale(option.label));
        ytcenter.language.addLocaleElement(labelText, option.label, "@textContent");
        
        if (option.style) {
          ytcenter.utils.each(option.style, function(key, value){
            optionWrapper.style.setProperty(key, value);
          });
        }
        
        label = document.createElement("span");
        label.className = "ytcenter-settings-option-label";
        label.appendChild(labelText);
        
        if (option.help && option.help !== "") {
          help = document.createElement("a");
          help.className = "ytcenter-settings-help";
          help.setAttribute("target", "_blank");
          help.setAttribute("href", option.help);
          help.appendChild(document.createTextNode('?'));
          replaceHelp = { "{option}": function() { return ytcenter.language.getLocale(option.label); } };
          help.setAttribute("title", ytcenter.utils.replaceTextToText(ytcenter.language.getLocale("SETTINGS_HELP_ABOUT"), replaceHelp));
          ytcenter.language.addLocaleElement(help, "SETTINGS_HELP_ABOUT", "title", replaceHelp);
          label.appendChild(help);
        }
        
        optionWrapper.appendChild(label);
      }
      if (!option.module)
        throw new Error("[Settings createOptionsForLayout] Option (" + option.id + ", " + option.label + ") doesn't have module!");
      if (!ytcenter.modules[option.module])
        throw new Error("[Settings createOptionsForLayout] Option (" + option.id + ", " + option.label + ", " + option.module + ") are using an non existing module!");

      moduleContainer = document.createElement("span");
      module = ytcenter.modules[option.module](option);
      moduleContainer.appendChild(module.element);
      
      module.bind(function(value){
        ytcenter.settings[option.defaultSetting] = value;
        ytcenter.events.performEvent("ui-refresh");
        
        if (option.listeners && option.listeners["update"]) {
          for (i = 0; i < option.listeners["update"].length; i++) {
            option.listeners["update"][i](value);
          }
        }
      });
      
      optionWrapper.appendChild(moduleContainer);
      frag.appendChild(optionWrapper);
    });
    
    return frag;
  };
  a.createLayout = function(){
    var frag = document.createDocumentFragment(),
        categoryList = document.createElement("ul"),
        subcatList = [],
        sSelectedList = [],
        leftPanel = document.createElement("div"), rightPanel = document.createElement("div"),
        rightPanelContent = document.createElement("div"),
        productVersion = document.createElement("div"),
        subcatTop = document.createElement("div"), subcatContent = document.createElement("div"),
        panelWrapper = document.createElement("div"),
        categoryHide = false;
    subcatTop.className = "ytcenter-settings-subcat-header-wrapper";
    subcatContent.className = "ytcenter-settings-subcat-content-wrapper";
    leftPanel.className = "ytcenter-settings-panel-left clearfix";
    rightPanel.className = "ytcenter-settings-panel-right clearfix";
    
    productVersion.className = "ytcenter-settings-version";
    productVersion.textContent = "YouTube Center v" + ytcenter.version;
    
    categoryList.className = "ytcenter-settings-category-list";
    categories.forEach(function(category){
      var li = document.createElement("li"),
          acat = document.createElement("a"),
          valign = document.createElement("span"),
          text = document.createElement("span"),
          subcatLinkList = [],
          subcatContentList = [],
          topheader = document.createElement("div"),
          topheaderList = document.createElement("ul"),
          categoryContent = document.createElement("div"),
          hideContent = false;
      sSelectedList.push(acat);
      acat.href = ";return false;";
      acat.className = "ytcenter-settings-category-item yt-valign" + (categoryHide ? "" : " ytcenter-selected");
      
      ytcenter.utils.addEventListener(acat, "click", function(e){
        category.select();
        
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, false);
      valign.className = "yt-valign-container";
      
      text.textContent = ytcenter.language.getLocale(category.label);
      ytcenter.language.addLocaleElement(text, category.label, "@textContent");
      
      valign.appendChild(text);
      acat.appendChild(valign);
      li.appendChild(acat);
      categoryList.appendChild(li);
      
      topheaderList.className = "ytcenter-settings-subcat-header clearfix";
      category.subcategories.forEach(function(subcat){
        var content = document.createElement("div"),
            liItem = document.createElement("li"),
            liItemLink = document.createElement("a"),
            itemTextContent = document.createElement("span");
        content.className = "ytcenter-settings-subcat-content" + (hideContent ? " hid" : "");
        liItem.className = "clearfix";
        liItemLink.className = "yt-uix-button ytcenter-settings-subcat-header-item" + (hideContent ? "" : " ytcenter-selected");
        itemTextContent.className = "ytcenter-settings-subcat-header-item-content";
        itemTextContent.textContent = ytcenter.language.getLocale(subcat.label);
        ytcenter.language.addLocaleElement(itemTextContent, subcat.label, "@textContent");
        
        content.appendChild(a.createOptionsForLayout(subcat));
        
        liItemLink.appendChild(itemTextContent);
        liItem.appendChild(liItemLink);
        topheaderList.appendChild(liItem);
        
        ytcenter.utils.addEventListener(liItemLink, "click", function(e){
          subcat.select();
          
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, false);
        subcatLinkList.push(liItemLink);
        subcatContentList.push(content);
        subcat.select = function(){
          subcatLinkList.forEach(function(item){
            ytcenter.utils.removeClass(item, "ytcenter-selected");
          });
          subcatContentList.forEach(function(item){
            ytcenter.utils.addClass(item, "hid");
          });
          ytcenter.utils.removeClass(content, "hid");
          ytcenter.utils.addClass(liItemLink, "ytcenter-selected");
        };
        
        categoryContent.appendChild(content);
        hideContent = true;
      });
      topheader.appendChild(topheaderList);
      
      topheader.className = (categoryHide ? "hid" : "");
      categoryContent.className = (categoryHide ? "hid" : "");
      
      subcatList.push(topheader);
      subcatList.push(categoryContent);
      subcatTop.appendChild(topheader);
      subcatContent.appendChild(categoryContent);
      
      category.select = function(){
        sSelectedList.forEach(function(item){
          ytcenter.utils.removeClass(item, "ytcenter-selected");
        });
        subcatList.forEach(function(item){
          ytcenter.utils.addClass(item, "hid");
        });
        ytcenter.utils.addClass(acat, "ytcenter-selected");
        ytcenter.utils.removeClass(topheader, "hid");
        ytcenter.utils.removeClass(categoryContent, "hid");
      };
      categoryHide = true;
    });
    
    leftPanel.appendChild(categoryList);
    leftPanel.appendChild(productVersion);
    
    rightPanelContent.appendChild(subcatTop);
    rightPanelContent.appendChild(subcatContent);
    
    rightPanel.appendChild(rightPanelContent);
    
    rightPanelContent.className = "ytcenter-settings-panel-right-content";
    panelWrapper.className = "ytcenter-settings-content";
    
    panelWrapper.appendChild(leftPanel);
    panelWrapper.appendChild(rightPanel);
    
    frag.appendChild(panelWrapper);
    
    return frag;
  };
  
  a.createDialog = function(){
    var dialog = ytcenter.dialog("SETTINGS_TITLE", a.createLayout(), [], "top"),
        closeButton = document.createElement("div"),
        closeIcon = document.createElement("img");
    closeIcon.className = "close";
    closeIcon.setAttribute("src", "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
    closeButton.style.position = "absolute";
    closeButton.style.top = "0";
    closeButton.style.right = "0";
    closeButton.style.margin = "0";
    closeButton.className = "yt-alert";
    closeButton.appendChild(closeIcon);
    ytcenter.utils.addEventListener(closeButton, "click", function(){
      dialog.setVisibility(false);
    }, false);
    dialog.getHeader().appendChild(closeButton);
    dialog.getHeader().style.margin = "0 -20px 0px";
    dialog.getBase().style.overflowY = "scroll";
    dialog.getFooter().style.display = "none";
    dialog.getContent().className += " clearfix";
    return dialog;
  };
  return a;
})();
