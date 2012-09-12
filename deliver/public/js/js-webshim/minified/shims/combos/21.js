jQuery.webshims.register("form-message",function(a,c,r,k,v,m){var d=c.validityMessages,r=m.overrideMessages||m.customMessages?["customValidationMessage"]:[];d.en=a.extend(!0,{typeMismatch:{email:"Please enter an email address.",url:"Please enter a URL.",number:"Please enter a number.",date:"Please enter a date.",time:"Please enter a time.",range:"Invalid input.","datetime-local":"Please enter a datetime."},rangeUnderflow:{defaultMessage:"Value must be greater than or equal to {%min}."},rangeOverflow:{defaultMessage:"Value must be less than or equal to {%max}."},
stepMismatch:"Invalid input.",tooLong:"Please enter at most {%maxlength} character(s). You entered {%valueLen}.",patternMismatch:"Invalid input. {%title}",valueMissing:{defaultMessage:"Please fill out this field.",checkbox:"Please check this box if you want to proceed."}},d.en||d["en-US"]||{});["select","radio"].forEach(function(a){d.en.valueMissing[a]="Please select an option."});["date","time","datetime-local"].forEach(function(a){d.en.rangeUnderflow[a]="Value must be at or after {%min}."});["date",
"time","datetime-local"].forEach(function(a){d.en.rangeOverflow[a]="Value must be at or before {%max}."});d["en-US"]=d["en-US"]||d.en;d[""]=d[""]||d["en-US"];d.de=a.extend(!0,{typeMismatch:{email:"{%value} ist keine zul\u00e4ssige E-Mail-Adresse",url:"{%value} ist keine zul\u00e4ssige Webadresse",number:"{%value} ist keine Nummer!",date:"{%value} ist kein Datum",time:"{%value} ist keine Uhrzeit",range:"{%value} ist keine Nummer!","datetime-local":"{%value} ist kein Datum-Uhrzeit Format."},rangeUnderflow:{defaultMessage:"{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen k\u00f6nnen."},
rangeOverflow:{defaultMessage:"{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen k\u00f6nnen."},stepMismatch:"Der Wert {%value} ist in diesem Feld nicht zul\u00e4ssig. Hier sind nur bestimmte Werte zul\u00e4ssig. {%title}",tooLong:"Der eingegebene Text ist zu lang! Sie haben {%valueLen} Zeichen eingegeben, dabei sind {%maxlength} das Maximum.",patternMismatch:"{%value} hat f\u00fcr dieses Eingabefeld ein falsches Format! {%title}",valueMissing:{defaultMessage:"Bitte geben Sie einen Wert ein",
checkbox:"Bitte aktivieren Sie das K\u00e4stchen"}},d.de||{});["select","radio"].forEach(function(a){d.de.valueMissing[a]="Bitte w\u00e4hlen Sie eine Option aus"});["date","time","datetime-local"].forEach(function(a){d.de.rangeUnderflow[a]="{%value} ist zu fr\u00fch. {%min} ist die fr\u00fcheste Zeit, die Sie benutzen k\u00f6nnen."});["date","time","datetime-local"].forEach(function(a){d.de.rangeOverflow[a]="{%value} ist zu sp\u00e4t. {%max} ist die sp\u00e4teste Zeit, die Sie benutzen k\u00f6nnen."});
var u=d[""];c.createValidationMessage=function(c,d){var h=u[d];h&&"string"!==typeof h&&(h=h[a.prop(c,"type")]||h[(c.nodeName||"").toLowerCase()]||h.defaultMessage);h&&"value,min,max,title,maxlength,label".split(",").forEach(function(d){if(-1!==h.indexOf("{%"+d)){var p=("label"==d?a.trim(a('label[for="'+c.id+'"]',c.form).text()).replace(/\*$|:$/,""):a.attr(c,d))||"";h=h.replace("{%"+d+"}",p);"value"==d&&(h=h.replace("{%valueLen}",p.length))}});return h||""};(c.bugs.validationMessage||!Modernizr.formvalidation||
c.bugs.bustedValidity)&&r.push("validationMessage");c.activeLang({langObj:d,module:"form-core",callback:function(a){u=a}});r.forEach(function(d){c.defineNodeNamesProperty(["fieldset","output","button"],d,{prop:{value:"",writeable:!1}});["input","select","textarea"].forEach(function(k){var h=c.defineNodeNameProperty(k,d,{prop:{get:function(){var d=this,k="";if(!a.prop(d,"willValidate"))return k;var m=a.prop(d,"validity")||{valid:1};if(m.valid||(k=c.getContentValidationMessage(d,m)))return k;if(m.customError&&
d.nodeName&&(k=Modernizr.formvalidation&&!c.bugs.bustedValidity&&h.prop._supget?h.prop._supget.call(d):c.data(d,"customvalidationMessage")))return k;a.each(m,function(a,h){if("valid"!=a&&h&&(k=c.createValidationMessage(d,a)))return!1});return k||""},writeable:!1}})})})});
(!Modernizr.formvalidation||jQuery.webshims.bugs.bustedValidity)&&jQuery.webshims.register("form-extend",function(a,c,r,k){c.inputTypes=c.inputTypes||{};var v=c.cfg.forms,m,d=c.inputTypes,u={radio:1,checkbox:1};c.addInputType=function(a,f){d[a]=f};var z={customError:!1,typeMismatch:!1,rangeUnderflow:!1,rangeOverflow:!1,stepMismatch:!1,tooLong:!1,patternMismatch:!1,valueMissing:!1,valid:!0},w={valueMissing:function(b,f,g){if(!b.prop("required"))return!1;var d=!1;if(!("type"in g))g.type=(b[0].getAttribute("type")||
b[0].type||"").toLowerCase();if("select"==g.nodeName){if(f=!f)if(!(f=0>b[0].selectedIndex))b=b[0],f="select-one"==b.type&&2>b.size?!!a("> option:first-child",b).prop("selected"):!1;b=f}else b=u[g.type]?"checkbox"==g.type?!b.is(":checked"):!c.modules["form-core"].getGroupElements(b).filter(":checked")[0]:!f;return b},tooLong:function(){return!1},typeMismatch:function(a,f,g){if(""===f||"select"==g.nodeName)return!1;var c=!1;if(!("type"in g))g.type=(a[0].getAttribute("type")||a[0].type||"").toLowerCase();
if(d[g.type]&&d[g.type].mismatch)c=d[g.type].mismatch(f,a);else if("validity"in a[0])c=a[0].validity.typeMismatch;return c},patternMismatch:function(a,f,g){if(""===f||"select"==g.nodeName)return!1;a=a.attr("pattern");if(!a)return!1;try{a=RegExp("^(?:"+a+")$")}catch(d){c.error('invalid pattern value: "'+a+'" | '+d),a=!1}return!a?!1:!a.test(f)}};c.addValidityRule=function(a,f){w[a]=f};a.event.special.invalid={add:function(){a.event.special.invalid.setup.call(this.form||this)},setup:function(){var b=
this.form||this;if(!a.data(b,"invalidEventShim")&&(a(b).data("invalidEventShim",!0).bind("submit",a.event.special.invalid.handler),c.moveToFirstEvent(b,"submit"),c.bugs.bustedValidity&&a.nodeName(b,"form"))){var f=b.getAttribute("novalidate");b.setAttribute("novalidate","novalidate");c.data(b,"bustedNoValidate",null==f?null:f)}},teardown:a.noop,handler:function(b){if(!("submit"!=b.type||b.testedValidity||!b.originalEvent||!a.nodeName(b.target,"form")||a.prop(b.target,"noValidate"))){m=!0;b.testedValidity=
!0;if(!a(b.target).checkValidity())return b.stopImmediatePropagation(),m=!1;m=!1}}};var h=function(b){if(!a.support.submitBubbles&&b&&"object"==typeof b&&!b._submit_attached)a.event.add(b,"submit._submit",function(a){a._submit_bubble=!0}),b._submit_attached=!0};if(!a.support.submitBubbles&&a.event.special.submit)a.event.special.submit.setup=function(){if(a.nodeName(this,"form"))return!1;a.event.add(this,"click._submit keypress._submit",function(b){b=b.target;b=a.nodeName(b,"input")||a.nodeName(b,
"button")?a.prop(b,"form"):void 0;h(b)})};a.event.special.submit=a.event.special.submit||{setup:function(){return!1}};var B=a.event.special.submit.setup;a.extend(a.event.special.submit,{setup:function(){a.nodeName(this,"form")?a(this).bind("invalid",a.noop):a("form",this).bind("invalid",a.noop);return B.apply(this,arguments)}});a(r).bind("invalid",a.noop);c.addInputType("email",{mismatch:function(){var a=v.emailReg||/^[a-zA-Z0-9.!#$%&'*+-\/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;return function(f){return!a.test(f)}}()});
c.addInputType("url",{mismatch:function(){var a=v.urlReg||/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
return function(f){return!a.test(f)}}()});c.defineNodeNameProperty("input","type",{prop:{get:function(){var a=(this.getAttribute("type")||"").toLowerCase();return c.inputTypes[a]?a:this.type}}});c.defineNodeNamesProperties(["button","fieldset","output"],{checkValidity:{value:function(){return!0}},willValidate:{value:!1},setCustomValidity:{value:a.noop},validity:{writeable:!1,get:function(){return a.extend({},z)}}},"prop");var p=function(b){var f,g=a.prop(b,"validity");if(g)a.data(b,"cachedValidity",
g);else return!0;if(!g.valid){f=a.Event("invalid");var d=a(b).trigger(f);if(m&&!p.unhandledInvalids&&!f.isDefaultPrevented())c.validityAlert.showFor(d),p.unhandledInvalids=!0}a.removeData(b,"cachedValidity");return g.valid},C=/^(?:select|textarea|input)/i;c.defineNodeNameProperty("form","checkValidity",{prop:{value:function(){var b=!0,f=a(a.prop(this,"elements")).filter(function(){if(!C.test(this.nodeName))return!1;var a=c.data(this,"shadowData");return!a||!a.nativeElement||a.nativeElement===this});
p.unhandledInvalids=!1;for(var g=0,d=f.length;g<d;g++)p(f[g])||(b=!1);return b}}});c.defineNodeNamesProperties(["input","textarea","select"],{checkValidity:{value:function(){p.unhandledInvalids=!1;return p(a(this).getNativeElement()[0])}},setCustomValidity:{value:function(b){a.removeData(this,"cachedValidity");c.data(this,"customvalidationMessage",""+b)}},willValidate:{writeable:!1,get:function(){var b={button:1,reset:1,hidden:1,image:1};return function(){var f=a(this).getNativeElement()[0];return!(f.disabled||
f.readOnly||b[f.type])}}()},validity:{writeable:!1,get:function(){var b=a(this).getNativeElement(),f=b[0],g=a.data(f,"cachedValidity");if(g)return g;g=a.extend({},z);if(!a.prop(f,"willValidate")||"submit"==f.type)return g;var d=b.val(),i={nodeName:f.nodeName.toLowerCase()};g.customError=!!c.data(f,"customvalidationMessage");if(g.customError)g.valid=!1;a.each(w,function(a,f){if(f(b,d,i))g[a]=!0,g.valid=!1});a(this).getShadowFocusElement().attr("aria-invalid",g.valid?"false":"true");f=b=null;return g}}},
"prop");c.defineNodeNamesBooleanProperty(["input","textarea","select"],"required",{set:function(b){a(this).getShadowFocusElement().attr("aria-required",!!b+"")},initAttr:!a.browser.msie||7<c.browserVersion});c.reflectProperties(["input"],["pattern"]);if(!("maxLength"in k.createElement("textarea"))){var s=function(){var b,f=0,c=a([]),d=1E9,i=function(){var a=c.prop("value"),b=a.length;b>f&&b>d&&(b=Math.max(f,d),c.prop("value",a.substr(0,b)));f=b},l=function(){clearTimeout(b);c.unbind(".maxlengthconstraint")};
return function(t,q){l();if(-1<q)d=q,f=a.prop(t,"value").length,c=a(t),c.bind("keydown.maxlengthconstraint keypress.maxlengthconstraint paste.maxlengthconstraint cut.maxlengthconstraint",function(){setTimeout(i,0)}),c.bind("keyup.maxlengthconstraint",i),c.bind("blur.maxlengthconstraint",l),b=setInterval(i,200)}}();s.update=function(b,f){a(b).is(":focus")&&(null==f&&(f=a.prop(b,"maxlength")),s(e.target,f))};a(k).bind("focusin",function(b){var f;"TEXTAREA"==b.target.nodeName&&-1<(f=a.prop(b.target,
"maxlength"))&&s(b.target,f)});c.defineNodeNameProperty("textarea","maxlength",{attr:{set:function(a){this.setAttribute("maxlength",""+a);s.update(this)},get:function(){var a=this.getAttribute("maxlength");return null==a?void 0:a}},prop:{set:function(a){if("number"==typeof a||a&&a==1*a){if(0>a)throw"INDEX_SIZE_ERR";a=parseInt(a,10);this.setAttribute("maxlength",a);s.update(this,a)}else this.setAttribute("maxlength","0"),s.update(this,0)},get:function(){var a=this.getAttribute("maxlength");return("number"==
typeof a||a&&a==1*a)&&0<=a?parseInt(a,10):-1}}});c.defineNodeNameProperty("textarea","maxLength",{prop:{set:function(b){a.prop(this,"maxlength",b)},get:function(){return a.prop(this,"maxlength")}}})}var D={submit:1,button:1,image:1},n={};[{name:"enctype",limitedTo:{"application/x-www-form-urlencoded":1,"multipart/form-data":1,"text/plain":1},defaultProp:"application/x-www-form-urlencoded",proptype:"enum"},{name:"method",limitedTo:{get:1,post:1},defaultProp:"get",proptype:"enum"},{name:"action",proptype:"url"},
{name:"target"},{name:"novalidate",propName:"noValidate",proptype:"boolean"}].forEach(function(b){var f="form"+(b.propName||b.name).replace(/^[a-z]/,function(a){return a.toUpperCase()}),c="form"+b.name,d=b.name,i="click.webshimssubmittermutate"+d,l=function(){if("form"in this&&D[this.type]){var l=a.prop(this,"form");if(l){var i=a.attr(this,c);if(null!=i&&(!b.limitedTo||i.toLowerCase()===a.prop(this,f))){var j=a.attr(l,d);a.attr(l,d,i);setTimeout(function(){if(null!=j)a.attr(l,d,j);else try{a(l).removeAttr(d)}catch(b){l.removeAttribute(d)}},
9)}}}};switch(b.proptype){case "url":var t=k.createElement("form");n[f]={prop:{set:function(b){a.attr(this,c,b)},get:function(){var b=a.attr(this,c);if(null==b)return"";t.setAttribute("action",b);return t.action}}};break;case "boolean":n[f]={prop:{set:function(b){b?a.attr(this,"formnovalidate","formnovalidate"):a(this).removeAttr("formnovalidate")},get:function(){return null!=a.attr(this,"formnovalidate")}}};break;case "enum":n[f]={prop:{set:function(b){a.attr(this,c,b)},get:function(){var f=a.attr(this,
c);return!f||(f=f.toLowerCase())&&!b.limitedTo[f]?b.defaultProp:f}}};break;default:n[f]={prop:{set:function(b){a.attr(this,c,b)},get:function(){var b=a.attr(this,c);return null!=b?b:""}}}}n[c]||(n[c]={});n[c].attr={set:function(b){n[c].attr._supset.call(this,b);a(this).unbind(i).bind(i,l)},get:function(){return n[c].attr._supget.call(this)}};n[c].initAttr=!0;n[c].removeAttr={value:function(){a(this).unbind(i);n[c].removeAttr._supvalue.call(this)}}});c.defineNodeNamesProperties(["input","button"],
n);!a.support.getSetAttribute&&null==a("<form novalidate></form>").attr("novalidate")?c.defineNodeNameProperty("form","novalidate",{attr:{set:function(a){this.setAttribute("novalidate",""+a)},get:function(){var a=this.getAttribute("novalidate");return null==a?void 0:a}}}):c.bugs.bustedValidity&&(c.defineNodeNameProperty("form","novalidate",{attr:{set:function(a){c.data(this,"bustedNoValidate",""+a)},get:function(){var a=c.data(this,"bustedNoValidate");return null==a?void 0:a}},removeAttr:{value:function(){c.data(this,
"bustedNoValidate",null)}}}),a.each(["rangeUnderflow","rangeOverflow","stepMismatch"],function(a,c){w[c]=function(a){return(a[0].validity||{})[c]||!1}}));c.defineNodeNameProperty("form","noValidate",{prop:{set:function(b){b?a.attr(this,"novalidate","novalidate"):a(this).removeAttr("novalidate")},get:function(){return null!=a.attr(this,"novalidate")}}});a.browser.webkit&&Modernizr.inputtypes.date&&function(){var b={updateInput:1,input:1},f={date:1,time:1,"datetime-local":1},d={focusout:1,blur:1},h=
{updateInput:1,change:1},i=function(a){var c,f=!0,i=a.prop("value"),j=i,o=function(c){if(a){var o=a.prop("value");o!==i&&(i=o,(!c||!b[c.type])&&a.trigger("input"));c&&h[c.type]&&(j=o);!f&&o!==j&&a.trigger("change")}},A,y=function(b){clearInterval(c);setTimeout(function(){b&&d[b.type]&&(f=!1);a&&(a.unbind("focusout blur",y).unbind("input change updateInput",o),o());a=null},1)};clearInterval(c);c=setInterval(o,160);clearTimeout(A);A=setTimeout(o,9);a.unbind("focusout blur",y).unbind("input change updateInput",
o);a.bind("focusout blur",y).bind("input updateInput change",o)};if(a.event.customEvent)a.event.customEvent.updateInput=!0;(function(){var b=function(b){var c=1,f,j;if("date"==b.type&&(m||!a(b).is(":focus")))if((j=b.value)&&10>j.length&&(j=j.split("-"))&&3==j.length){for(;3>c;c++)if(1==j[c].length)j[c]="0"+j[c];else if(2!=j[c].length){f=!0;break}if(!f)return j=j.join("-"),a.prop(b,"value",j),j}},f,i,d,j;f=c.defineNodeNameProperty("input","checkValidity",{prop:{value:function(){b(this);return f.prop._supvalue.apply(this,
arguments)}}});i=c.defineNodeNameProperty("form","checkValidity",{prop:{value:function(){a("input",this).each(function(){b(this)});return i.prop._supvalue.apply(this,arguments)}}});d=c.defineNodeNameProperty("input","value",{prop:{set:function(){return d.prop._supset.apply(this,arguments)},get:function(){return b(this)||d.prop._supget.apply(this,arguments)}}});j=c.defineNodeNameProperty("input","validity",{prop:{writeable:!1,get:function(){b(this);return j.prop._supget.apply(this,arguments)}}});a(k).bind("change",
function(a){isChangeSubmit=!0;b(a.target);isChangeSubmit=!1})})();a(k).bind("focusin",function(b){b.target&&f[b.target.type]&&!b.target.readOnly&&!b.target.disabled&&i(a(b.target))})}();c.addReady(function(b,c){var d;a("form",b).add(c.filter("form")).bind("invalid",a.noop);try{if(b==k&&!("form"in(k.activeElement||{})))(d=a("input[autofocus], select[autofocus], textarea[autofocus]",b).eq(0).getShadowFocusElement()[0])&&d.offsetHeight&&d.offsetWidth&&d.focus()}catch(h){}});(!Modernizr.formattribute||
!Modernizr.fieldsetdisabled)&&function(){(function(b,c){a.prop=function(f,d,g){var j;if(f&&1==f.nodeType&&g===c&&a.nodeName(f,"form")&&f.id){j=k.getElementsByName(d);if(!j||!j.length)j=k.getElementById(d);if(j&&(j=a(j).filter(function(){return a.prop(this,"form")==f}).get(),j.length))return 1==j.length?j[0]:j}return b.apply(this,arguments)}})(a.prop,void 0);var b=function(b){var c=a.data(b,"webshimsAddedElements");c&&(c.remove(),a.removeData(b,"webshimsAddedElements"))},f=/\r?\n/g,d=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
E=/^(?:select|textarea)/i;Modernizr.formattribute||(c.defineNodeNamesProperty(["input","textarea","select","button","fieldset"],"form",{prop:{get:function(){var b=c.contentAttr(this,"form");b&&(b=k.getElementById(b))&&!a.nodeName(b,"form")&&(b=null);return b||this.form},writeable:!1}}),c.defineNodeNamesProperty(["form"],"elements",{prop:{get:function(){var b=this.id,c=a.makeArray(this.elements);b&&(c=a(c).add('input[form="'+b+'"], select[form="'+b+'"], textarea[form="'+b+'"], button[form="'+b+'"], fieldset[form="'+
b+'"]').not(".webshims-visual-hide > *").get());return c},writeable:!1}}),a(function(){var c=function(a){a.stopPropagation()};a(k).bind("submit",function(c){if(!c.isDefaultPrevented()){var f=c.target;if(c=f.id)b(f),c=a('input[form="'+c+'"], select[form="'+c+'"], textarea[form="'+c+'"]').filter(function(){return!this.disabled&&this.name&&this.form!=f}).clone(),c.length&&(a.data(f,"webshimsAddedElements",a('<div class="webshims-visual-hide" />').append(c).appendTo(f)),setTimeout(function(){b(f)},9)),
c=null}});a(k).bind("click",function(b){if(!b.isDefaultPrevented()&&a(b.target).is('input[type="submit"][form], button[form], input[type="button"][form], input[type="image"][form], input[type="reset"][form]')){var f=a.prop(b.target,"form"),d=b.target.form,g;f&&f!=d&&(g=a(b.target).clone().removeAttr("form").addClass("webshims-visual-hide").bind("click",c).appendTo(f),d&&b.preventDefault(),h(f),g.trigger("click"),setTimeout(function(){g.remove();g=null},9))}})}));Modernizr.fieldsetdisabled||c.defineNodeNamesProperty(["fieldset"],
"elements",{prop:{get:function(){return a("input, select, textarea, button, fieldset",this).get()||[]},writeable:!1}});a.fn.serializeArray=function(){return this.map(function(){var b=a.prop(this,"elements");return b?a.makeArray(b):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||E.test(this.nodeName)||d.test(this.type))}).map(function(b,c){var d=a(this).val();return null==d?null:a.isArray(d)?a.map(d,function(a){return{name:c.name,value:a.replace(f,"\r\n")}}):{name:c.name,
value:d.replace(f,"\r\n")}}).get()}}();(function(){Modernizr.textareaPlaceholder=!!("placeholder"in a("<textarea />")[0]);var b=a.browser.webkit&&Modernizr.textareaPlaceholder&&535>c.browserVersion;if(!Modernizr.input.placeholder||!Modernizr.textareaPlaceholder||b){var f="over"==c.cfg.forms.placeholderType,d=c.cfg.forms.responsivePlaceholder,k=["textarea"];Modernizr.input.placeholder||k.push("input");var i=function(a){try{if(a.setSelectionRange)return a.setSelectionRange(0,0),!0;if(a.createTextRange){var b=
a.createTextRange();b.collapse(!0);b.moveEnd("character",0);b.moveStart("character",0);b.select();return!0}}catch(c){}},l=function(b,c,d,g){!1===d&&(d=a.prop(b,"value"));if(!f&&"password"!=b.type){if(!d&&g&&i(b)){var k=setTimeout(function(){i(b)},9);a(b).unbind(".placeholderremove").bind("keydown.placeholderremove keypress.placeholderremove paste.placeholderremove input.placeholderremove",function(f){if(!f||!(17==f.keyCode||16==f.keyCode))b.value=a.prop(b,"value"),c.box.removeClass("placeholder-visible"),
clearTimeout(k),a(b).unbind(".placeholderremove")}).bind("mousedown.placeholderremove drag.placeholderremove select.placeholderremove",function(){i(b);clearTimeout(k);k=setTimeout(function(){i(b)},9)}).bind("blur.placeholderremove",function(){clearTimeout(k);a(b).unbind(".placeholderremove")});return}b.value=d}else if(!d&&g){a(b).unbind(".placeholderremove").bind("keydown.placeholderremove keypress.placeholderremove paste.placeholderremove input.placeholderremove",function(f){if(!f||!(17==f.keyCode||
16==f.keyCode))c.box.removeClass("placeholder-visible"),a(b).unbind(".placeholderremove")}).bind("blur.placeholderremove",function(){a(b).unbind(".placeholderremove")});return}c.box.removeClass("placeholder-visible")},h=function(b,c,d,g,i){if(!g&&(g=a.data(b,"placeHolder"),!g))return;a(b).unbind(".placeholderremove");if("focus"==i||!i&&a(b).is(":focus"))("password"==b.type||f||a(b).hasClass("placeholder-visible"))&&l(b,g,"",!0);else if(!1===c&&(c=a.prop(b,"value")),c)l(b,g,c);else if(!1===d&&(d=a.attr(b,
"placeholder")||""),d&&!c){c=g;!1===d&&(d=a.prop(b,"placeholder"));if(!f&&"password"!=b.type)b.value=d;c.box.addClass("placeholder-visible")}else l(b,g,c)},q=function(b){var b=a(b),c=b.prop("id"),f=!(!b.prop("title")&&!b.attr("aria-labelledby"));!f&&c&&(f=!!a('label[for="'+c+'"]',b[0].form)[0]);f||(c||(c=a.webshims.getID(b)),f=!!a("label #"+c)[0]);return a(f?'<span class="placeholder-text"></span>':'<label for="'+c+'" class="placeholder-text"></label>')},x=function(){var b={text:1,search:1,url:1,
email:1,password:1,tel:1};return{create:function(b){var c=a.data(b,"placeHolder"),i;if(c)return c;c=a.data(b,"placeHolder",{});a(b).bind("focus.placeholder blur.placeholder",function(a){h(this,!1,!1,c,a.type);c.box["focus"==a.type?"addClass":"removeClass"]("placeholder-focused")});(i=a.prop(b,"form"))&&a(i).bind("reset.placeholder",function(a){setTimeout(function(){h(b,!1,!1,c,a.type)},0)});if("password"==b.type||f)c.text=q(b),c.box=d||a(b).is(".responsive-width")||-1!=(b.currentStyle||{width:""}).width.indexOf("%")?
c.text:a(b).wrap('<span class="placeholder-box placeholder-box-'+(b.nodeName||"").toLowerCase()+" placeholder-box-"+a.css(b,"float")+'" />').parent(),c.text.insertAfter(b).bind("mousedown.placeholder",function(){h(this,!1,!1,c,"focus");try{setTimeout(function(){b.focus()},0)}catch(a){}return!1}),a.each(["lineHeight","fontSize","fontFamily","fontWeight"],function(f,d){var g=a.css(b,d);c.text.css(d)!=g&&c.text.css(d,g)}),a.each(["Left","Top"],function(f,d){var g=(parseInt(a.css(b,"padding"+d),10)||
0)+Math.max(parseInt(a.css(b,"margin"+d),10)||0,0)+(parseInt(a.css(b,"border"+d+"Width"),10)||0);c.text.css("padding"+d,g)}),a(b).bind("updateshadowdom",function(){var f,d;((d=b.offsetWidth)||(f=b.offsetHeight))&&c.text.css({width:d,height:f}).css(a(b).position())}).triggerHandler("updateshadowdom");else{var j=function(f){a(b).hasClass("placeholder-visible")&&(l(b,c,""),f&&"submit"==f.type&&setTimeout(function(){f.isDefaultPrevented()&&h(b,!1,!1,c)},9))};a(r).bind("beforeunload",j);c.box=a(b);i&&
a(i).submit(j)}return c},update:function(f,d){var g=(a.attr(f,"type")||a.prop(f,"type")||"").toLowerCase();!b[g]&&!a.nodeName(f,"textarea")?(c.error('placeholder not allowed on input[type="'+g+'"]'),"date"==g&&c.error('but you can use data-placeholder for input[type="date"]')):(g=x.create(f),g.text&&g.text.text(d),h(f,!1,d,g))}}}();a.webshims.publicMethods={pHolder:x};k.forEach(function(a){c.defineNodeNameProperty(a,"placeholder",{attr:{set:function(a){b?(c.data(this,"textareaPlaceholder",a),this.placeholder=
""):c.contentAttr(this,"placeholder",a);x.update(this,a)},get:function(){return(b?c.data(this,"textareaPlaceholder"):"")||c.contentAttr(this,"placeholder")}},reflect:!0,initAttr:!0})});k.forEach(function(f){var d={},g;["attr","prop"].forEach(function(f){d[f]={set:function(d){var i;b&&(i=c.data(this,"textareaPlaceholder"));i||(i=c.contentAttr(this,"placeholder"));a.removeData(this,"cachedValidity");var j=g[f]._supset.call(this,d);i&&"value"in this&&h(this,d,i);return j},get:function(){return a(this).hasClass("placeholder-visible")?
"":g[f]._supget.call(this)}}});g=c.defineNodeNameProperty(f,"value",d)})}})();(function(){if(!("value"in k.createElement("output"))){c.defineNodeNameProperty("output","value",{prop:{set:function(c){var d=a.data(this,"outputShim");d||(d=b(this));d(c)},get:function(){return c.contentAttr(this,"value")||a(this).text()||""}}});c.onNodeNamesPropertyModify("input","value",function(b,c,d){"removeAttr"!=d&&(c=a.data(this,"outputShim"))&&c(b)});var b=function(b){if(!b.getAttribute("aria-live")){var b=a(b),
d=(b.text()||"").trim(),h=b.attr("id"),i=b.attr("for"),l=a('<input class="output-shim" type="text" disabled name="'+(b.attr("name")||"")+'" value="'+d+'" style="display: none !important;" />').insertAfter(b),m=l[0].form||k,q=function(a){l[0].value=a;a=l[0].value;b.text(a);c.contentAttr(b[0],"value",a)};b[0].defaultValue=d;c.contentAttr(b[0],"value",d);b.attr({"aria-live":"polite"});h&&(l.attr("id",h),b.attr("aria-labelledby",c.getID(a('label[for="'+h+'"]',m))));i&&(h=c.getID(b),i.split(" ").forEach(function(a){(a=
k.getElementById(a))&&a.setAttribute("aria-controls",h)}));b.data("outputShim",q);l.data("outputShim",q);return q}};c.addReady(function(c,d){a("output",c).add(d.filter("output")).each(function(){b(this)})});(function(){var b={updateInput:1,input:1},d={radio:1,checkbox:1,submit:1,button:1,image:1,reset:1,file:1,color:1},h=function(a){var d,g=a.prop("value"),h=function(d){if(a){var h=a.prop("value");h!==g&&(g=h,(!d||!b[d.type])&&c.triggerInlineForm&&c.triggerInlineForm(a[0],"input"))}},k,j=function(){clearTimeout(k);
k=setTimeout(h,9)},m=function(){a.unbind("focusout",m).unbind("keyup keypress keydown paste cut",j).unbind("input change updateInput",h);clearInterval(d);setTimeout(function(){h();a=null},1)};clearInterval(d);d=setInterval(h,99);j();a.bind("keyup keypress keydown paste cut",j).bind("focusout",m).bind("input updateInput change",h)};if(a.event.customEvent)a.event.customEvent.updateInput=!0;a(k).bind("focusin",function(b){b.target&&b.target.type&&!b.target.readOnly&&!b.target.disabled&&"input"==(b.target.nodeName||
"").toLowerCase()&&!d[b.target.type]&&h(a(b.target))})})()}})()});