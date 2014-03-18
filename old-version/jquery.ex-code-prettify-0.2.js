/*
 * 	Ex Code Prettify 0.2 - jQuery plugin
 *	written by cyokodog
 *
 *	Copyright (c) 2013 cyokodog 
 *		http://d.hatena.ne.jp/cyokodog/)
 *		http://cyokodog.tumblr.com/
 *		http://www.cyokodog.net/
 *	MIT LICENCE
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */

;(function($){

	// Namespace
	$.ex = $.ex || {};

	// Constructor
	var plugin = $.ex.codePrettify = function(target, option){
		var o = this,
		c = o.config = $.extend(true,{}, $.ex.codePrettify.defaults, option, o.getJsonData(target) || {});

		c.target = c.orgTarget = target.eq(0);
		if(c.target.prop('tagName') == 'TEXTAREA'){
			var v = $.trim(c.target.val());
			c.textarea = c.target.val(v);
			c.target = $('<pre/>').insertBefore(c.target);
			c.target.text(c.textarea.val());
		}
		else{
			c.textarea = $('<textarea/>').insertAfter(c.target);
			c.textarea.val($.trim(c.target.text()));
			c.target.text(c.textarea.val());
		}
		c.textarea.prop('readonly', true);
		c.contents = c.target.add(c.textarea).wrapAll('<div/>').parent().addClass(plugin.id + '-contents');
		c.tools = $('<div><span class="title"></span></div>').addClass(plugin.id + '-tools').prependTo(c.contents);
		c.title = c.title || $.trim((' ' + c.orgTarget[0].className + ' ').match(new RegExp(' javascript | css | html ','ig'))) || '';
		!c.title || c.tools.find('.title').text(c.title);

		if(c.showRawButton){
			c.rawButton = $('<a href="#" class="raw">Raw</a>').appendTo(c.tools);
			c.rawButton.on('click',function(){
				o.toggleRawButton();
				return false;
			});
			c.target.on('dblclick',function(){
				o.toggleRawButton();
				c.textarea.select();
				return false;
			});
			c.textarea.on('dblclick',function(){
				o.toggleRawButton();
				return false;
			});
		}

		c.target.addClass(plugin.id).addClass('prettyprint');
		!c.prettyClass || c.target.addClass(c.prettyClass);
		prettyPrint();
		c.textarea.height(c.target.height());
	}

	// API
	$.extend($.ex.codePrettify.prototype, {

		// config の取得
		getConfig : function(){
			return this.config;
		},

		// json 形式の独自データ属性 の取得
		getJsonData : function(target,name){
			try{eval('var r = ' + (target || this.config.target).attr('data-' + (name || plugin.paramId)));}catch(e){return undefined;}
			return r;
		},

		getParam : function(name){
			var o = this, c = o.config;
			var v = c[name];
			return typeof v != 'function' ? v : v.apply(o);
		},

		// プラグイン適用オブジェクトの取得
		getTarget : function(){
			return this.config.target;
		},

		toggleRawButton : function(){
			var o = this, c = o.config;
			o._toggleButton('raw-mode', c.rawButton, 'Raw', 'Back');
		},

		_toggleClass : function(className, callback){
			var o = this, c = o.config;
			var className = plugin.id + '-' + className;
			var hasClass = c.contents.hasClass(className);
			!callback || callback.apply(o,[hasClass]);
			hasClass ? c.contents.removeClass(className) : c.contents.addClass(className);
		},
		
		_toggleButton : function(className, button, label1, label2){
			var o = this, c = o.config;
			o._toggleClass(className, function(hasClass){
				$(button).text(hasClass ? label1 : label2);
			});
		}

	});

	// Setting
	$.extend($.ex.codePrettify,{
		defaults : {
			api : false,	// true の場合 api オブジェクトを返す
			prettyClass : 'linenums',
			title : '',
			showRawButton : true
		},
		version : '0.2',
		id : 'ex-code-prettify',
		paramId : 'ex-code-prettify-param'
	});

	// jQuery Method
	$.fn.exCodePrettify = function(option){
		var targets = this,api = [];
		targets.each(function(index) {
			var target = targets.eq(index);
			var obj = target.data(plugin.id) ||
				new $.ex.codePrettify(target, $.extend({}, option, {'targets': targets, 'index': index}));
			api.push(obj);
			target.data(plugin.id, obj);
		});
		return option && option.api ? ($.ex.api ? $.ex.api(api) : api) : targets;
	}

})(jQuery);
