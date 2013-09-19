/*
 * 	Hash Contents 0.3 - jQuery plugin
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

	// jQuery Style API
	var API = function(api){
		var api = $(api),api0 = api[0];
		for(var name in api0)
			(function(name){
				if($.isFunction( api0[name] ))
					api[ name ] = (/^get[^a-z]/.test(name)) ?
						function(){
							return api0[name].apply(api0,arguments);
						} : 
						function(){
							var arg = arguments;
							api.each(function(idx){
								var apix = api[idx];
								apix[name].apply(apix,arg);
							})
							return api;
						}
			})(name);
		return api;
	}

	// Constructor
	var plugin = $.hashContents = function(target, option){
		var o = this,
		c = o.config = $.extend(true,{}, plugin.defaults, option, o.getJsonData(target) || {});
		c.target = target;



		c.isHeaderTag = /^H\d$/.test(c.target.prop('tagName'));
		if(c.isHeaderTag) c.toggle = false;
		if(!c.toggle) c.reload = false;
		c.id = c.target.prop('id') || c.prefix + (c.index + 1);
		c.toggle ? (!c.target.prop('id') || c.target.prop('id','')) : (c.target.prop('id') || c.target.prop('id',c.id))
		c.list = $('<li/>');
		c.title = o.getParam('title') || c.prefix + (c.index + 1);
		var a = $('<a/>').prop('href', '#' + c.id).text(c.title);
		a.on('click',function(){
			if(c.reload){
				var reload = function(){
					location.reload();
				}
				if(c.fade) $('body').fadeOut(reload);
				else setTimeout(reload,0);
				return true;
			}
			if(location.hash == '#'+c.id) return false;
			location.hash = c.id;
			o.showContents(c.index);
			return false;
		});
		c.list.append(a);
		if(c.listTo){
			c.list.appendTo(c.listTo);
		}
		if(location.hash == '#'+c.id){
			c.targets.data(plugin.id + '-current-index', c.index);
		}
	}

	// API
	$.extend(plugin.prototype, {

		// config の取得
		getConfig : function(){
			return this.config;
		},

		// json 形式の独自データ属性 の取得
		getJsonData : function(target,name){
			try{eval('var r = ' + (target || this.config.target).attr('data-' + (name || plugin.paramId)));}catch(e){return undefined;}
			return r;
		},

		// パラメータの取得
		getParam : function(name){
			var o = this, c = o.config;
			var v = c[name];
			return typeof v != 'function' ? v : v.apply(o,[o]);
		},

		// プラグイン適用オブジェクトの取得
		getTarget : function(){
			return this.config.target;
		},

		// 索引の取得
		getIndex : function(){
			return this.config.index;
		},

		// コンテンツの表示
		showContents : function(){
			var o = this, c = o.config;
			c.targets.each(function(idx){
				var t = $(this);
				t.data(plugin.id).config.list.removeClass('active');
				if(c.index != idx){
					!c.toggle || (c.reload ? t.remove() : t.hide());
				}
			});
			c.list.addClass('active');

if(c.titleTo) $(c.titleTo).text(c.title);

			if(!c.reload){
				if(c.toggle){
					var top1 = $(window).scrollTop();
					c.target.data(plugin.id).config.list.addClass('active');
					var top2 = c.target.show().offset().top;
					var init = function(){
						if(top1 > top2) $('html,body').animate({scrollTop:top2});
						c.targets.data(plugin.id + '-current-index', c.index);
						if(!c.init){
							c.init = true;
							c.onActive.apply(o,[o]);
						}
					}
					if(c.fade) c.target.hide().fadeIn(init);
					else init();
				}
			}
			else{
				c.onActive.apply(o,[o]);
			}
		}
	});

	// Setting
	$.extend(plugin,{
		defaults : {
			api : false,	// true の場合 api オブジェクトを返す
			prefix : 'contents',
			listTo : '',
			reload : true,
			toggle : true,
			fade : true,
			titleSelector : 'h3',
			title : function(api){
				var o = api, c = o.config;
				return c.isHeaderTag ? c.target.text() : c.target.find(c.titleSelector).eq(0).text();
			},
			onActive : function(api){}
		},
		version : '0.3',
		id : 'hash-contents',
		paramId : 'hash-contents-param'
	});

	// jQuery Method
	$.fn.hashContents = function(option){
		var targets = this,api = [];
		targets.each(function(index) {
			var target = targets.eq(index);
			var obj = target.data(plugin.id) ||
				new plugin(target, $.extend({}, option, {'targets': targets, 'index': index}));
			api.push(obj);
			target.data(plugin.id, obj);
		});
		var current = targets.data(plugin.id + '-current-index') || 0;
		targets.eq(current).data(plugin.id).showContents();
		return option && option.api ? API(api) : targets;
	}

})(jQuery);
