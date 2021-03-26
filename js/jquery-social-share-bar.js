/**
 * jquery-social-share-bar
 * Copyright: Jesse Nieminen, Viima Solutions Oy
 * 
 * License: MIT
 * --------------------
 * Modified from https://github.com/ewebdev/jquery-share
 */

(function ($, window, undefined) {
  "use strict";

  $.fn.share = function (method) {

    var helpers = {
      channels: {
        facebook: {url: 'https://www.facebook.com/share.php?u=|u|'},
        twitter: {url: 'https://twitter.com/share?url=|u|&text=|140|'},
        linkedin: {url: 'https://www.linkedin.com/shareArticle?mini=true&url=|u|&title=|t|&summary=|d|'},
        tumblr: {url: 'https://www.tumblr.com/share?v=3&u=|u|'},
        digg: {url: 'https://digg.com/submit?url=|u|&title=|t|'},
        reddit: {url: 'https://reddit.com/submit?url=|u|'},
        pinterest: {url: 'https://pinterest.com/pin/create/button/?url=|u|&media=&description=|d|'},
        stumbleupon: {url: 'https://www.stumbleupon.com/submit?url=|u|&title=|t|'},
        email: {url: 'mailto:?subject=|t|&body=You might want to check this out: |u|'},
        whatsapp: {url: 'https://wa.me/?text=|t| |u|'},
        telegram: {url: 'https://t.me/share/url?url=|u|&text=|t|'},
      }
    };

    var methods = {

      init: function (options) {
        this.share.settings = $.extend({}, this.share.defaults, options);

        var settings = this.share.settings,
          pageTitle = settings.title || document.title || '',
          pageUrl = settings.pageUrl || window.location.href,
          pageDesc = settings.pageDesc || $('head > meta[name="description"]').attr("content") || '',
          u = encodeURIComponent(pageUrl),
          t = encodeURIComponent(pageTitle);

        // Each instance of this plugin
        return this.each(function () {
          var $element = $(settings.containerTemplate(settings)).appendTo($(this)),
            id = $element.attr("id"),
            d = pageDesc.substring(0, 250),
            href;

          // Append HTML for each network button
          if ((settings.channels.indexOf('webshareapi') > -1) && (navigator.share !== undefined)) {
            $(settings.itemTemplate({provider: 'webshareapi', itemTriggerClass: settings.itemTriggerClass})).appendTo($element);
          }
          else {
            for (var item in settings.channels) {
              item = settings.channels[item];
              if ((item !== 'webshareapi') && (item !== 'comment')) {
                href = helpers.channels[item].url;
                href = href.replace('|u|', u).replace('|t|', t).replace('|d|', d)
                  .replace('|140|', t.substring(0, 130));
                $(settings.itemTemplate({provider: item, href: href, itemTriggerClass: settings.itemTriggerClass})).appendTo($element);
              }
            }
          }
          if (settings.channels.indexOf('comment') > -1) {
            $(settings.itemTemplate({provider: 'comment', comment: settings.comment, itemTriggerClass: settings.itemTriggerClass})).appendTo($element);
          }

          // Bind click
          $element.on('click', '.' + settings.itemTriggerClass, function (e) {
            if ($(this).hasClass('webshareapi')) {
              e.preventDefault();
              navigator.share({
                title: t,
                text : d,
                url: u
              });
            }
            else if (!($(this).hasClass('comment'))) {
              e.preventDefault();
              var top = (screen.height / 2) - (settings.popupHeight / 2),
                  left = (screen.width / 2) - (settings.popupWidth / 2);
              window.open($(this).data('href') || $(this).attr('href'), 't', 'toolbar=0,resizable=1,status=0,copyhistory=no,width=' + settings.popupWidth + ',height=' + settings.popupHeight + ',top=' + top + ',left=' + left);
            }
            else if (($(this).hasClass('comment')) && (settings.comment.action !== undefined)) {
              window[settings.comment.action](e);
            }
          });
        });// End plugin instance
      }
    };

    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method "' + method + '" does not exist in social plugin');
    }

  };

  $.fn.share.defaults = {
    popupWidth: 640,
    popupHeight: 528,
    channels: ['facebook', 'twitter', 'linkedin', 'email'],
    itemTriggerClass: 'js-share',
    containerTemplate: function (props) {
      return '<ul class="sharing-providers"></ul>';
    },

    itemTemplate: function (props) {
      var iconClasses = {
        'facebook': 'fab fa-facebook-f',
        'twitter': 'fab fa-twitter',
        'linkedin': 'fab fa-linkedin-in',
        'pinterest': 'fab fa-pinterest-p',
        'tumblr': 'fab fa-tumblr',
        'stumbleupon': 'fab fa-stumbleupon',
        'reddit': 'fab fa-reddit-alien',
        'digg': 'fab fa-digg',
        'email': 'fas fa-envelope',
        'whatsapp': 'fab fa-whatsapp',
        'telegram': 'fab fa-telegram-plane',
        'comment': 'fas fa-comment',
        'webshareapi': 'fas fa-share-alt',
      }

      // Special handling for email
      var providerName = props.provider === 'email' ? 'email' : props.provider.charAt(0).toUpperCase() + props.provider.slice(1);

      if (props.provider === 'webshareapi') {
        return '<li class="' + props.provider + '">' +
        '<a href="#" title="Share" class="' + props.itemTriggerClass + ' ' + props.provider + '">' +
        '<i class="' + iconClasses[props.provider] + '"></i>' +
        '</a>' +
        '</li>';
      }
      if (props.provider === 'comment') {
        return '<li class="separator"></li>' +
        '<li class="' + props.provider + '">' +
        '<a href="' + ((props.comment.href !== undefined) ? props.comment.href : '#') + '" title="Comment on this page" class="' + props.itemTriggerClass + ' ' + props.provider + '">' +
          '<i class="' + iconClasses[props.provider] + '">' +
          (((props.comment.number !== undefined) && Number.isInteger(props.comment.number)) ?
           '<span class="' + props.itemTriggerClass + ' comment-number' + '">' + props.comment.number + '</span>' : '') +
           '</i>' +
        '</a>' +
        '</li>';
      }
      return '<li class="' + props.provider + '">' +
        '<a href="#" data-href="' + props.href + '" title="Share this page ' + (props.provider === 'email' ? 'via ' : 'on ') + providerName + '" class="' + props.itemTriggerClass + ' ' + props.provider + '">' +
        '<i class="' + iconClasses[props.provider] + '"></i>' +
        '</a>' +
        '</li>';
    }
  };

  $.fn.share.settings = {};

})(jQuery, window);
