/**
 * Partial Include Loader
 * Fetches HTML partials for elements with [data-include] attributes
 * and injects them into the DOM, then fires a custom event.
 *
 * Usage: <div data-include="navbar"></div>
 *        <div data-include="footer"></div>
 */
(function () {
  'use strict';

  var INCLUDE_BASE = '/_includes/';

  function loadIncludes() {
    var elements = document.querySelectorAll('[data-include]');
    if (!elements.length) {
      document.dispatchEvent(new CustomEvent('includesLoaded'));
      return;
    }

    var total   = elements.length;
    var loaded  = 0;

    function onLoaded() {
      loaded++;
      if (loaded === total) {
        document.dispatchEvent(new CustomEvent('includesLoaded'));
      }
    }

    elements.forEach(function (el) {
      var name = el.getAttribute('data-include');
      var url  = INCLUDE_BASE + name + '.html';

      fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to load include: ' + url + ' (status ' + response.status + ')');
          }
          return response.text();
        })
        .then(function (html) {
          // Create a temporary container to parse and extract scripts
          var temp = document.createElement('div');
          temp.innerHTML = html;

          // Replace the placeholder element with the parsed content
          var parent = el.parentNode;
          while (temp.firstChild) {
            parent.insertBefore(temp.firstChild, el);
          }
          parent.removeChild(el);

          // Re-execute any inline scripts in the loaded partial
          var scripts = parent.querySelectorAll('script');
          scripts.forEach(function (oldScript) {
            var newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(function (attr) {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
          });

          // Mark active nav link
          setActiveNavLink();

          onLoaded();
        })
        .catch(function (err) {
          console.warn('[loader.js]', err.message);
          el.innerHTML = '<!-- Include not found: ' + name + ' -->';
          onLoaded();
        });
    });
  }

  function setActiveNavLink() {
    var path = window.location.pathname;

    // Desktop nav links
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (path === href || (href !== '/' && path.startsWith(href))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile nav links
    document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (path === href || (href !== '/' && path.startsWith(href))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIncludes);
  } else {
    loadIncludes();
  }
})();
