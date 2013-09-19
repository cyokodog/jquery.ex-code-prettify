/*
 * 	Ex Inplace Editor 0.2 - jQuery plugin
 *	written by Cyokodog	
 *
 *	Copyright (c) 2013 Cyokodog (http://d.hatena.ne.jp/cyokodog/)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */
(function($){

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

	var measur = function( target , f){
		var hide = target.is(":hidden");
		if( hide ) target.show();
		var ret = f.apply( target , [target] );	
		if( hide ) target.hide();
		return ret;
	}

	$.ex = $.ex || {};
	var plugin = $.ex.inPlaceEditor = function(idx , targets , option){
		var o = this,
		c = o.config = $.extend({} , plugin.defaults , option);
		c.targets = targets;
		c.target = c.targets.eq(idx);
		c.index = idx;

		if(c.bootstrap){
			$.extend(c, plugin.bootstrap);
			c.wrapper = c.target.wrap('<div/>').parent();
		}

		c.nullText = c.nulltext ? c.nulltext : c.nullText;
		if( c.directEdit ){
			c.editLabel = false;
		}
		c.tag = c.target.prop('tagName');
		if (/INPUT|TEXTAREA/.test( c.tag )) {
			c.isTextarea = ( c.tag == 'TEXTAREA' );
			c.editor = c.target;
			var labelTag = c.directEdit ? 'a' : 'span';
			if (c.convertCR == 'li') {
				if (!c.isTextarea) {
					c.convertCR = plugin.defaults.convertCR;
				}
				else{
					labelTag = 'ul';
					c.htmlEditor = false;
					c.htmlEditorAutoConvertCR = true;
				}
			}
			c.label = $('<' + labelTag + '/>');
			if (labelTag == 'a') {
				c.label.prop('href','javascript:void(0)');
			}
			c.editor.before(c.label);
			c.label.html( o.getReplaceValue(o._INPUTtoHTML(c.editor.val())) );
		}
		else{
			if (c.tag == 'UL') {
				c.editorType = 'textarea';
				c.convertCR = 'li';
				c.htmlEditor = false;
				c.htmlEditorAutoConvertCR = true;
			}
			c.isTextarea = ( c.editorType == 'textarea' );
			c.label = c.target;
			c.editor = $('<' + c.editorType + '/>');
			c.isTextarea || c.editor.prop('type','text');
			c.label.after( c.editor );
			c.editor.val( o._HTMLtoINPUT(c.label.html()) );
			c.label.html( o.getReplaceValue(o._INPUTtoHTML(c.editor.val())) );
			if (c.displayStyle == 'auto' && !c.isTextarea ) {
				c.displayStyle = c.target.css('display');
			}
		}
		if( c.displayStyle == 'auto' ){
			c.displayStyle = c.isTextarea ? 'block' : 'inline';
		}
		if(c.displayStyle == 'inline' && c.wrapper){
			c.wrapper.css({display:'inline'}).addClass('form-inline');
		}


		if( c.displayStyle == 'inline' || !c.isTextarea ){
			c.convertCR = 'br';
		}
		c.displayClass = 'ex-ipe-' + c.displayStyle;

		c.editor.addClass('ex-ipe-editor');
		c.label.addClass('ex-ipe-label');

		c.editors = c.editor.wrap( '<span class="' + c.displayClass + '"></span>' ).parent();

		if( c.saveLabel || c.cancelLabel ){
			c.saveTool = $('<span class="ex-ipe-save-tool"/>');
			if( c.saveLabel ){
				c.saveTool.append( c.saveButton = $('<a class="ex-ipe-save" href="javascript:void(0)"/>').text(c.saveLabel).addClass(c.saveClass));
			}
			if( c.cancelLabel ){
				c.saveTool.append( c.cancelButton = $('<a class="ex-ipe-cancel" href="javascript:void(0)"/>').text(c.cancelLabel).addClass(c.cancelClass) );
			}
			c.editors.append( c.saveTool );
		}
		c.labels = c.label.wrap( '<span class="' + c.displayClass + '"></span>' ).parent();

		o._moveMargin(c.label,c.labels);

		if( c.editLabel ){
			c.editTool = $('<span class="ex-ipe-edit-tool" style="text-align:' + c.editLabelAlign + '"/>');
			c.editButton = $('<a class="ex-ipe-icon" href="javascript:void(0)"/>').addClass(c.editClass).prop('title',c.editTitle);
			(typeof c.editLabel) || c.editButton.text(c.editLabel);
			c.editTool.append(c.editButton);
			c.labels.append( c.editTool );
		}
		c.msgbox = $('<div class="ex-ipe-msgbox"/>').appendTo('body');

		if( c.directEdit ){
			c.label.bind('click.ex-ipe mousedown.ex-ipe',function(){
				o.showEditor({
					focus : true
				});
				return false;
			});
			if( c.hoverSpot ){
				c.label.hover(function(){
					c.label.addClass('ex-ipe-spot');					
				},function(){
					setTimeout(function(){
						c.label.removeClass('ex-ipe-spot');					
					},c.hoverSpotDelay);
				});
			}
		}
		c.editor.bind('keydown.ex-ipe',function(evt){
			if(evt.keyCode == c.escKey){
				o.cancel({
					focus : true
				});
				return false;
			}
			else
			if( !c.isTextarea && evt.keyCode == c.saveKey){
				o.save({
					focus : true
				});
				return false;
			}
		});
		if( c.editButton ){
			c.editButton
				.bind('click.ex-ipe',function(){
					o.showEditor({
						focus : true
					});
					return false;
				})
				.hover(function(){
					c.label.addClass('ex-ipe-spot');					
				},function(){
					c.label.removeClass('ex-ipe-spot');					
				});
		}
		if( c.saveButton ){
			c.saveButton.bind('click.ex-ipe',function(){
				o.save({
					focus : true
				});
				return false;
			});
		}
		if( c.cancelButton ){
			c.cancelButton.bind('click.ex-ipe',function(){
				o.cancel({
					focus : true
				});
				return false;
			});
		}
		o.hideEditor();


		c.oninit ? c.oninit(o,o) : c.onInit(o,o);
	}
	$.extend(plugin.prototype, {
		_focus : function( target ){
			var o = this , c = o.config;
			setTimeout(function(){
				target.focus();
				if (c.dataSelect) target.select();
			},10);			
		},
		_moveMargin : function(from,to){
			var o = this , c = o.config;
			$.each(['top','right','bottom','left'],function(idx,pos){
				to.css('margin-' + pos,from.css('margin-' + pos));
				from.css('margin-' + pos,0);
			});
		},
		_INPUTtoHTML : function( input , noNullReplace){
			var o = this , c = o.config;
			var input = arguments.length ? input : o.getValue();
			var directEditLiLink = false;
			if (!c.htmlEditor) {
				input = o.escHTML( input );
				if( c.convertCR == 'br'){
					input = input.replace(/\n$/,'').replace(/\n/g,'<br/>');
				}
				else
				if( c.convertCR == 'p' ){
					input = input.replace(/\n$/,'')
					input = '<p>' + input.replace(/\n/ig,'</p><p>') + '</p>';
					input = input.replace(/<p><\/p>/ig,'');
				}
				else
				if( c.convertCR == 'li'){
					directEditLiLink = c.directEdit && c.directEditLiLink;
					if (input.length) {
						if (directEditLiLink) {
							input = '<li><a href="javascript:void(0)">' + input.replace(/\n/g,'</a></li><li><a href="javascript:void(0)">') + '</a></li>';
						}
						else {
							input = '<li>' + input.replace(/\n/g,'</li><li>') + '</li>';
						}
					}
				}
			}
			else
			if (c.htmlEditorAutoConvertCR) {
				if( c.convertCR == 'br'){
					input = input.replace(/\n$/,'').replace(/\n/g,'<br/>');
					input = input.replace(/><br\/>/ig,'>').replace(/<br\/></ig,'<');
				}
				else
				if( c.convertCR == 'p' ){
					input = input.replace(/\n$/,'')
					input = '%%%ps%%%' + input.replace(/\n/ig,'%%%pe%%%%%%ps%%%') + '%%%pe%%%';
					input = input.replace(/>%%%pe%%%/ig,'>').replace(/%%%ps%%%</ig,'<');
					input = input.replace(/%%%pe%%%/ig,'</p>').replace(/%%%ps%%%/ig,'<p>');
				}
			}
			if (!noNullReplace && input == '') {
				input = directEditLiLink ? '<a href="javascript:void(0)">' + c.nullText + '</a>' : c.nullText;
			}
			return input;
		},
		_HTMLtoINPUT : function( html , noNullReplace){
			var o = this , c = o.config;
			var html = arguments.length ? html : o.getLabel().html();
			if (!c.htmlEditor) {
				html = html.replace(/\n/ig,'');
				if( c.convertCR == 'br'){
					html = html.replace(/<BR>/ig,'%%%CR%%%');
				}
				else
				if( c.convertCR == 'p'){
					html = html.replace(/<BR>/ig,'%%%CR%%%').replace(/<P>|\s<P>/ig,'').replace(/<\/P>/ig,'%%%CR%%%');
				}
				else
				if( c.convertCR == 'li'){
					var temp = html;
					html = '';
					$('<ul>' + temp + '</ul>').find('> li').each(function(){
						html += ($(this).text() + '%%%CR%%%');
					});
				}
				var dummy = $('<div/>').html(html);
				html = dummy.text().replace(/%%%CR%%%/ig,'\n');
				dummy.remove();
			}
			else
			if (c.htmlEditorAutoConvertCR) {
				html = html.replace(/\n/ig,'');
				if( c.convertCR == 'br'){
					html = html.replace(/<BR>/ig,'\n');
				}
				else
				if( c.convertCR == 'p'){
					html = html.replace(/<BR>/ig,'\n').replace(/<P>|\s<P>/ig,'').replace(/<\/P>/ig,'\n');
				}
			}
			html = html.replace(/\n$/ig,'');
			return !noNullReplace ? html == c.nullText ? '' : html : html;
		},
		getTarget : function(){
			return this.config.target;
		},
		getEditor : function(){
			return this.config.editor;
		},
		getLabel : function(){
			return this.config.label;
		},
		getValue : function(){
			var o = this , c = o.config;
			return o.trimText( c.editor.val() );
		},
		getConvertValue : function(){
			var o = this , c = o.config;
			return o._INPUTtoHTML(o.getValue(),true);
		},
		getReplaceValue : function(val){
			var o = this , c = o.config;
			if (c.replaceLabel) {
				if (typeof c.replaceLabel == 'function') {
					var rep = c.replaceLabel.call(o,o);
					if (rep != undefined){
						val = rep;
					}
				}
				else {
					val = c.replaceLabel;
				}
			}
			return val;
		},
		showEditor : function( param ){
			var o = this , c = o.config , p = param || {};
			c._prevValue = o.getValue();
			c.labels.hide();
			var callback = function(){
				c.onShowEditor.apply( o , [o] );
				!p.callback || p.callback.apply( o , [o] );
				!p.focus || o._focus( c.editor );
			}
			if (c.effect && c.displayStyle == 'block') {
				c.editors.show(c.effect , callback);
			}
			else{
				c.editors.show();
				callback();				
			}
			return o;
		},
		hideEditor : function( param ){
			var o = this , c = o.config , p = param || {};
			c.editors.hide();

			var callback = function(){
				!p.callback || p.callback.apply( o , [o] );
				!p.focus || o._focus( c.label );
			}
			if (c.effect && c.displayStyle == 'block') {
				c.labels.show(c.effect , callback);
			}
			else{
				c.labels.show();
				callback();				
			}
			return o;
		},
		cancel : function( param ){
			var o = this , c = o.config , p = param || {};
			if( c._prevValue != undefined){
				c.editor.val( c._prevValue );
			}
			o.hideEditor( p );
			return o;
		},
		save : function( param ){
			var o = this , c = o.config , p = param || {};
			if(/undefined|true/.test(c.onsave ? c.onsave.call(o,o) : c.onSave.call(o,o))){
				o.commit( p );
			}
			return o;
		},
		commit : function( param ){
			var o = this , c = o.config , p = param || {};
			c.editor.val( o.getValue() );
			c.label.html( o.getReplaceValue(o._INPUTtoHTML()) );
			o.hideEditor( p );
			return o;
		},
		trimText : function( text ){
			return text.replace(/^\n+|\n+$/g,'').replace(/^\s+|\s+$/g, '');
		},
		escHTML : function( text ){
			return text.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		},

		/* message methods */
		showMessage : function( msg , param ){
			var o = this , c = o.config ,
			p = $.extend({
				hideTime : 3000,
				callback : null,
				closeButton : false,
				className : '',
				showMethod : 'slideDown'
			},param);
			var pos , height , width;
			measur( c.editor , function( target ){
				pos = target.offset();
				height = target.outerHeight();
				width = target.outerWidth();
			});
			c.msgbox[0].className = 'ex-ipe-msgbox ' + p.className;
			c.msgbox.css(
				c.displayStyle == 'block' ? {
					top : pos.top + height ,
					left : pos.left
				} : {
					top : pos.top,
					left : pos.left + width
				}
			).html('<span>' + msg + '</span>');

			var closeTimer;
			if( p.closeButton ){
				$('<a href="javascript:void(0)">' + p.closeButton + '</a>').addClass(c.errorCloseClass).appendTo(c.msgbox).click(function(){
//				$('<a href="javascript:void(0)" class="close">&times;</a>').appendTo(c.msgbox).click(function(){



					if(closeTimer){
						clearTimeout(closeTimer);
					}
					o.hideMessage( p );
					return false;			
				});
			}
			c.msgbox.hide()[p.showMethod]();
			if( p.hideTime ){
				closeTimer = setTimeout(function(){
					o.hideMessage( p );			
				},p.hideTime);
			}
			return o;
		},
		hideMessage : function( param ){
			var o = this , c = o.config ,
			p = $.extend({
				callback : null,
				hideMethod : 'slideUp'
			},param);
			c.msgbox[p.hideMethod]();
			if( p.callback ){
				p.callback();
			}
			return o;
		},
		saving : function( msg ){
			var o = this , c = o.config;
			c.editor.prop('disabled' , true );
			c.saveTool.css('visibility','hidden');
			o.showMessage( msg || c.savingMessage ,{
				className : 'ex-ipe-saving',
				showMethod : 'show',
				hideTime : false
			});
			return o;
		},
		saveComplete : function(){
			var o = this , c = o.config;
			o.hideMessage({
				hideMethod : 'hide',
				callback : function(){
					c.editor.prop('disabled' , false );
					c.saveTool.css('visibility','visible');
					o.commit();
				}
			});
			return o;
		},
		saveError : function( msg ){
			var o = this , c = o.config;
			c.editor.prop('disabled' , false );
			c.editor.focus();
			c.saveTool.css('visibility','hidden');
			o.showMessage( msg || 'error!' , {
//				closeButton : 'OK',
				closeButton : '&times;',
//				className : 'ex-ipe-err',
				className : c.errorClass,
				callback : function(){
					c.saveTool.css('visibility','visible');
				}
			});
			return o;
		}
	});

	plugin.bootstrap = {
		saveClass : 'btn btn-primary btn-small',
		cancelClass : 'btn btn-small',
		editClass : 'icon-edit',
		editLabel : true,
		errorClass : 'alert alert-error',
		errorCloseClass : 'close'
	}

	plugin.defaults = {
		editorType : 'input',	// or textarea
		htmlEditor : false,
		htmlEditorAutoConvertCR : true,
		displayStyle : 'auto',	// block or inline
		saveLabel : 'SAVE',		// or false
		cancelLabel : 'CANCEL',	// or false
		directEdit : true,	// true or false
		directEditLiLink : true,	// true or false
		editLabel : 'EDIT',		// or false
		editTitle : 'EDIT',
		editLabelAlign : 'left', // or center or right		
		saveKey : 13,
		escKey : 27,
		saveClass : 'ex-ipe-btn',
		cancelClass : 'ex-ipe-btn',
		editClass : 'ex-ipe-edit',
		errorClass : 'ex-ipe-err',
		errorCloseClass : 'ex-ipe-err-close',
		bootstrap : false,
		convertCR : 'br',		// or 'p' or 'li'
		nullText : '(none)',
		savingMessage : 'Saving...',
		hoverSpot : true,
		hoverSpotDelay : 100,
		nowHover : false,
		dataSelect : false,
		effect : 'fast',	//or slow or 'other easing name' or false
		replaceLabel : false,
		onInit : function(){},
		onSave : function(){},
		onShowEditor : function(){}
	}
	$.fn.exInplaceEditor = function(option){
		var targets = this,api = [];
		targets.each(function(idx) {
			var target = targets.eq(idx);
			var obj = target.data('ex-inplace-editor') || new plugin( idx , targets , option);
			api.push(obj);
			target.data('ex-inplace-editor',obj);
		});
		return option && option.api ? API(api) : targets;
	}
})(jQuery);
