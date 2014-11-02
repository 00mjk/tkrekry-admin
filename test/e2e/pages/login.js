var Page = require('astrolabe').Page;

module.exports = Page.create({

    url: { value: 'http://localhost:9999/#/login' },

    username: {
      get: function() {
        return this.findElement(this.by.model('user.email'));
      }
    },

    password: {
      get: function() {
        return this.findElement(this.by.model('user.password'));
      }
    },

    submit: {
      get: function() {
        return this.findElement(this.by.id('login-button'));
      }
    },

    logout: {
      value: function() {
       return this.findElement(this.by.css('[ng-click="logout()"]')).click();
      }
    },

    validLogin: {
      value: function(username, password) {
        var page = this;
        page.go();

        page.username.sendKeys(username);
        page.password.sendKeys(password);

        page.submit.click();
        return this.findElement(this.by.binding('currentUser.email')).getText();
      }
    },

    invalidLogin: {
      value: function (username, password) {
        var page = this;
        page.go();
        page.username.sendKeys(username);
        page.password.sendKeys(password);
        page.submit.click();
        return this.findElement(this.by.binding('errors.other')).getText();
      }
    }
});