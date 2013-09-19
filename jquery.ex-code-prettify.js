/*
 * 	Ex Code Prettify 0.3 - jQuery plugin
 *	written by cyokodog
 *
 *	Copyright (c) 2013 cyokodog 
 *		http://www.cyokodog.net/
 *		http://d.hatena.ne.jp/cyokodog/)
 *		http://cyokodog.tumblr.com/
 *	MIT LICENCE
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */

;(function($){

	var addIEStyle = function(style){
		var exp = /^\s+|\s+$/g;
		var css = document.createStyleSheet()
		var style = style.split('}')
		for(var i = 0;i < style.length;i++){
			var t = style[i].split('{');
			if(t.length > 1){
				css.addRule(
					t[0].replace(exp,''),
					t[1].replace(exp,'')
				);
			}
		}
		return css;
	}

	var repeat = function(v, count){
		var ret = '';
		for(var i = 0; i < count; i++) ret += v;
		return ret;
	}

	var tabIndent = function(target, v){
		if(!v) v = '\t';
		$(target)[plugin_on]('keydown', function(evt){
			try{
				if(evt.keyCode === 9){
					var elm = evt.target;
					var val = elm.value;
					var pos = elm.selectionStart;
					elm.value = val.substr(0, pos) + v + val.substr(pos, val.length);
					elm.setSelectionRange(pos + v.length, pos + v.length);
					return false;
				}
			}
			catch(e){
			}
		});
	}

	var tabToSpace = function(target, tabSize){
		var spc = repeat(' ', tabSize);
		var arr = target.val().split('\n');
		for(var i = 0; i < arr.length; i++){
			arr[i] = arr[i].replace(/\t/g, spc);
		}
		target.val(arr.join('\n'));
	}

	var behaveJs = function(target, c ){
		target = $(target);
		if(c.replaceTab && c.softTabs){
			tabToSpace(target, c.tabSize);
		}
		new Behave($.extend(c, {textarea:target[0]}));
	}


	// Namespace
	$.ex = $.ex || {};

	// Constructor
	var plugin = $.ex.codePrettify = function(target, option){
		var o = this,
		c = o.config = $.extend(true,{}, $.ex.codePrettify.defaults, option, o.getJsonData(target) || {});

		c.target = target;
		c._tag = {
			css : '<style/>',
			html : '<div class="demo-html"/>',
			script : '<script/>',
			jsFile : '<script/>',
			cssFile : '<link media="screen" rel="stylesheet" type="text/css"/>'
		}
		c._result = {};

		c.container = c.target.parents(c.container).eq(0);
		if(!c.container.size()) c.container = c.target.parent();

		c.defaultStyle = c.container.hasClass(plugin.id);

		c.codeArea = c.container.find(c.codeArea);
		c.demoArea = c.container.find(c.demoArea);
		c.demoTitleArea = c.container.find('span.demo-title-area');
		c.runButton = c.container.find(c.runButton);
		c.resetButton = c.container.find(c.resetButton);

		if(c.defaultStyle){
			if(c.codeArea.size())
				c.target.appendTo(c.codeArea);
			else
				c.codeArea = c.target.wrap('<div class="code-area"/>').parent();
		}
		if(!c.demoArea.size()){
			c.demoArea = $('<div class="demo-area"/>').prependTo(c.container);
			if(c.defaultStyle) {
				c.demoTitleArea = $('<span class="demo-title-area"><span class="demo-title"/></span>').prependTo(c.demoArea);
				c.demoTitleArea.find('span.demo-title').text(c.demoLabel);
			}
		}

		if(c.defaultStyle){
			c.demoArea[c.container.hasClass('demo-bottom') ? 'appendTo' : 'prependTo'](c.container);
			if(!c.runButton.size() && !c.resetButton.size() && (c.showRunButton || c.showResetButton)) {
				c.demoTool = $('<span class="demo-tool"/>').appendTo(c.demoTitleArea);
				if(c.showRunButton) c.runButton = $('<a class="run-button" href="#"/>').text(c.runLabel).appendTo(c.demoTool);
				if(c.showResetButton) c.resetButton = $('<a class="reset-button" href="#"/>').text(c.resetLabel).appendTo(c.demoTool);
			}
		}

		c.rendarFrom = c.demoArea.data(plugin.id + '-rendar-from') || [];
		c.rendarFrom.push(o);
		c.demoArea.data(plugin.id + '-rendar-from', c.rendarFrom);

		if(c.target.prop('tagName') == 'TEXTAREA'){
			c.textarea = c.target;
			c.pre = $('<pre/>').insertBefore(c.textarea);
		}
		else{
			c.pre = c.target;
			c.textarea = $('<textarea/>').insertAfter(c.pre);
			c.textarea.val($.trim(c.pre.text()));
		}


		if(c.tabToSpace){
			tabToSpace(c.textarea, c.tabToSpaceSize );
		}

 		c.contents = c.pre.add(c.textarea).wrapAll('<div/>').parent().addClass(plugin.id + '-contents');
		c.tools = $('<div><span class="title"></span></div>').addClass(plugin.id + '-tools').prependTo(c.contents);
		c.title = c.title || c.codeTypeTitle[c.codeType];
		!c.title || c.tools.find('.title').text(c.title);
		c.editTools = $('<span/>').addClass(plugin.id + '-edit-tools').appendTo(c.tools);
		c.viewTools = $('<span/>').addClass(plugin.id + '-view-tools').appendTo(c.tools);

		if(!c.editCode && !c.runButton.size() && !c.resetButton.size()){
			c.textarea.prop('readOnly',true);
			c.raw = $('<a href="#"/>').addClass(plugin.id + '-raw').text(c.rawLabel).appendTo(c.viewTools);
			c.back = $('<a href="#"/>').addClass(plugin.id + '-back').text(c.backLabel).appendTo(c.editTools);
			c.raw[plugin_on]('click', function(){
				o.editMode();
				c.textarea.select();
				return false;
			});
			c.back[plugin_on]('click', function(){
				o.viewMode();
				return false;
			});
			o._reset();
		}
		else{
			c.edit = $('<a href="#"/>').addClass(plugin.id + '-edit').text(c.editLabel).appendTo(c.viewTools);
			c.save = $('<a href="#"/>').addClass(plugin.id + '-save').text(c.saveLabel).appendTo(c.editTools);
			c.cancel = $('<a href="#"/>').addClass(plugin.id + '-cancel').text(c.cancelLabel).appendTo(c.editTools);
			c.edit[plugin_on]('click', function(){
				c._val = c.textarea.val();
				o.editMode();
				c.textarea.focus();
				return false;
			});
			c.cancel[plugin_on]('click', function(){
				c.textarea.val(c._val);
				o.viewMode();
				return false;
			});
			c.save[plugin_on]('click', function(){
				o.viewMode();
				o._pretty();
				o.resetDemo();
				return false;
			});
			if(c.runButton.size()){
				c.runButton[plugin_on]('click',function(){
					o.runDemo();
					return false;
				});
			}
			if(c.resetButton.size()){
				c.resetButton[plugin_on]('click', function(){
					o.resetDemo();
					return false;
				});
			}
			if(typeof Behave != 'undefined' && c.behaveJS){
				behaveJs(c.textarea[0], c.behaveJSParam);
			}
			else
			if(c.tabIndent){
//				tabIndent(c.textarea, c.tabToSpace ? repeat(' ', c.tabToSpaceSize) : '\t');
				tabIndent(c.textarea);
			}
			o._reset();
		}
		o._pretty();

		if(!c.showDemo){
			c.demoArea.hide();
			c.codeArea.addClass('hide-demo');
			c.container.addClass('ex-code-prettify-hide-demo');
		}
		else
		if(!c.showCode){
			c.contents.hide();
			c.container.addClass('ex-code-prettify-hide-code');
		}

		if(c.adjustEditorHeight && c.editCode){
			var timer;
			c.textarea[plugin_on]('keyup', function(){
				if(timer) clearTimeout(timer);
				timer = setTimeout(function(){
					c.textarea.height(o._calcTextareaHeight());
				},300);
			});
		}
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

		// 特定パラメータの取得
		getParam : function(name){
			var o = this, c = o.config;
			var v = c[name];
			return typeof v != 'function' ? v : v.apply(o, [o]);
		},

		// プラグイン適用オブジェクトの取得
		getTarget : function(){
			return this.config.target;
		},

		// 編集モードへの切り替え
		editMode : function(){
			var o = this, c = o.config;
			c.contents.addClass(plugin.id + '-edit-mode');
		},

		// 表示モードへの切り替え
		viewMode : function(){
			var o = this, c = o.config;
			c.contents.removeClass(plugin.id + '-edit-mode');
		},

		// デモの実行
		runDemo : function(){
			var o = this, c = o.config;
			c.rendarFrom = c.demoArea.data(plugin.id + '-rendar-from');
			$.each(c.rendarFrom, function(idx){
				c.rendarFrom[idx]._rendar();
			});
		},

		// デモのリセット
		resetDemo : function(){
			var o = this, c = o.config;
			c.rendarFrom = c.demoArea.data(plugin.id + '-rendar-from');
			$.each(c.rendarFrom, function(idx){
				c.rendarFrom[idx]._reset();
			});
		},

		// テキストエリアの高さ調整
		_calcTextareaHeight : function(pre){
			var o = this, c = o.config;
			if(!pre){
				pre = $('<pre class="dummy"/>').insertBefore(c.textarea);
				pre.text(c.textarea.val());
				pre.addClass('prettyprint');
				prettyPrint();
			}
			var h = (pre.height() +
				parseInt(c.textarea.css('padding-top'),10) +
				parseInt(c.textarea.css('padding-bottom'),10) +
				50
			);
			if(pre.hasClass('dummy')) pre.remove();
			return h;
		},

		// Google Code Pretty の実行
		_pretty : function(){
			var o = this, c = o.config;
			var v = $.trim(c.textarea.val());
			c.textarea.val(v);
			if(c.pre) c.pre.remove();
			c.pre = $('<pre/>').insertBefore(c.textarea);
			c.pre.text(v);
			c.pre.addClass(plugin.id).addClass('prettyprint');
			!c.prettyClass || c.pre.addClass(c.prettyClass);
			prettyPrint();
			c.textarea.css({
				'font-family' : c.pre.css('font-family'),
				'font-size' : c.pre.css('font-size'),
				'line-height' : c.pre.css('line-height')
			});
			c.textarea.height(o._calcTextareaHeight(c.pre));
		},


		// デモオブジェクトの生成
		_rendar : function(){
			var o = this, c = o.config;
			o._remove();
			var code = c.textarea.val();
			if(!code || !c.codeType) return undefined;

			if(/file$/ig.test(c.codeType)){
				var nodes = [];

				var arr = code.split('\n');
				$.each(arr,function(idx){
					if(arr[idx]){
						var node = $(c._tag[c.codeType]).prop(/^js/ig.test(c.codeType) ? 'src' : 'href', arr[idx]);
						!c.demoArea || node.appendTo(c.demoArea);
						nodes.push(node[0]);
					}
				});
				return c._result[c.codeType] = $(nodes);
			}

			if(c.codeType == 'script'){
				code = '(function(){%1})();'.replace('%1',code);
			}
			var r = c._result[c.codeType] = $(c._tag[c.codeType]);
			if(c.codeType=='script') try{eval(code)}catch(e){}
			else {
				try{
					r.html(code)
				}
				catch(e){
					c.codeType != 'css' || r.data(plugin.id + '-ie-style',addIEStyle(code));
				}
			}
			!c.demoArea || r.appendTo(c.demoArea);
			return r;
		},

		// デモオブジェクトの削除
		_remove : function(){
			var o = this, c = o.config;
			var r = c._result[c.codeType];
			if(r){
				var ie = r.data(plugin.id + '-ie-style');
				!ie || ie.removeRule();
				r.remove();
			}
		},

		// デモの実行をリセット
		_reset : function(){
			var o = this, c = o.config;
			o._remove();
			!c.autoRun || setTimeout(function(){o._rendar();},0);
		}
	});

	// Setting
	$.extend($.ex.codePrettify,{
		defaults : {
			api : false, // true の場合 api オブジェクトを返す。
			prettyClass : 'linenums', // linenums を指定すると行番号が表示される。
			title : '', // コードのヘッダタイトルを指定。
			codeTypeTitle : { // title パラメータ未指定時に設定されるコードのヘッダタイトル。
				css : 'CSS',
				html : 'HTML',
				script : 'JavaScript',
				jsFile : 'JS File',
				cssFile : 'CSS File'
			},
			editCode : false, // true でコードの編集が可能になる。
			tabIndent : true, // true でコード編集時 Tab キーによるインデントが可能になる。
			tabToSpace : false, // true で Google Code Prettify によるコード表示時、Tab をスペースに置換する。
			tabToSpaceSize: 4, // tabToSpace が true 時に置換するスペースの数を指定。

			behaveJS : false, // true で Behave.js を有効にする。
			behaveJSParam : { // Behave.js の初期パラメータ。
				textarea: null,
				replaceTab: true,
				softTabs: true,
				tabSize: 4,
				autoOpen: true,
				overwrite: true,
				autoStrip: true,
				autoIndent: true,
				fence: false
			},

			codeType : '', // "css","html","script","jsFile","cssFile" のいずれかを指定。
			autoRun : true, // true でデモを自動実行する。
			container : '.ex-code-prettify', // デモ、コードのコンテナ要素のセレクタを指定。
			codeArea : 'div.code-area', // コードの出力先要素のセレクタを指定。
			demoArea : 'div.demo-area', // デモの出力先要素のセレクタを指定。
			editLabel : 'EDIT', // 編集ボタンのラベル。
			saveLabel : 'SAVE', // 編集内容の確定ボタンのラベル。
			cancelLabel : 'CANCEL', // 編集内容の取り消しボタンのラベル。
			rawLabel : 'RAW', // プレーン表示モードボタンのラベル。
			backLabel : 'BACK', // プレーン表示モードから戻るボタンのラベル。
			demoLabel : 'DEMO', // デモコンテンツのタイトルラベル。
			showRunButton : false, // true でデモ実行ボタンが表示される。
			runButton : '.run-button', // デモ実行ボタンのセレクタを指定。
			runLabel : 'RUN', // デモ実行ボタンのラベル。
			showResetButton : false, // true でデモリセットボタンが表示される。
			resetButton : '.reset-button', // デモリセットボタンのセレクタを指定。
			resetLabel : 'RESET', // デモリセットボタンのラベル。
			adjustEditorHeight : true, // true で編集モード時のテキストエリアの高さを自動調整する。
			showCode : true, // true でコードを表示する
			showDemo : false // true でデモを表示する
		},
		version : '0.3',
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

	var plugin_on = plugin.id + '_on';
	$.fn[plugin_on] = function(trigger, event){
		var name = trigger+'.'+plugin.id;
		$(this).off(name).on(name, event);
	}

})(jQuery);
