;(function () {
  try {
    var LS_KEY = 'ao_theme_pref'
    var COOKIE_KEY = 'ao_theme_pref'
    var DEFAULT_THEME = 'slate'
    var DEFAULT_MODE = 'dark'
    var ALLOWED_THEMES = ['default', 'verdant', 'slate', 'ocean', 'forest', 'lavender', 'amber']
    var ALLOWED_MODES = ['dark', 'light']

    function apply(theme, mode) {
      var body = document.body
      if (!body) return
      var classes = Array.prototype.slice.call(body.classList)
      classes.forEach(function (cls) {
        if (cls.indexOf('theme-') === 0 || cls.indexOf('mode-') === 0) {
          body.classList.remove(cls)
        }
      })
      body.classList.add('theme-' + theme)
      body.classList.add('mode-' + mode)
    }

    function fromCookie() {
      var match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_KEY + '=([^;]*)'))
      if (!match) return null
      try {
        return JSON.parse(decodeURIComponent(match[1]))
      } catch (_) {
        return null
      }
    }

    var stored = null
    try {
      var raw = localStorage.getItem(LS_KEY)
      stored = raw ? JSON.parse(raw) : null
    } catch (_) {
      stored = null
    }
    if (!stored) {
      stored = fromCookie()
    }
    if (!stored || ALLOWED_THEMES.indexOf(stored.theme) === -1 || ALLOWED_MODES.indexOf(stored.mode) === -1) {
      stored = { theme: DEFAULT_THEME, mode: DEFAULT_MODE }
    }
    apply(stored.theme, stored.mode)
  } catch (error) {
    // Fallback to defaults on any error
    document.body.classList.add('theme-slate', 'mode-dark')
  }
})()

