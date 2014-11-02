var Page = require('astrolabe').Page;

var helper = require('../spec_helper');

module.exports = Page.create({

    url: { value: 'http://localhost:9999/#/' },

    employerDropDownList: {
      value: function() {
        this.go();
        return this.findElements(this.by.binding('employer.name'));
      }
    },

    employerInput: {
      value: function(selected) {
        return this.findElement(this.by.model('selectedEmployer')).findElements(by.tagName('option')).then(function(options) {
          options[selected].click();
        });
      }
    },

    titleInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.title'));
      }
    },

    jobProfessionGroupInput: {
      value: function(selected) {
        return this.findElement(this.by.model('advertisement.job_profession_group')).findElements(by.tagName('option')).then(function(options) {
          options[selected].click();
        });
      }
    },

    jobTypeInput: {
      value: function(selected) {
        return this.findElement(this.by.model('advertisement.job_type')).findElements(by.tagName('option')).then(function(options) {
          options[selected].click();
        });
      }
    },

    jobDurationInput: {
      value: function(selected) {
        return this.findElement(this.by.model('advertisement.job_duration')).findElements(by.tagName('option')).then(function(options) {
          options[selected].click();
        });
      }
    },

    workingHoursInput: {
      value: function(selected) {
        return this.findElement(this.by.model('advertisement.working_hours')).findElements(by.tagName('option')).then(function(options) {
          options[selected].click();
        });
      }
    },

    workBeginsInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.work_begins'));
      }
    },

    descriptionInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.description'));
      }
    },

    officeInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.office'));
      }
    },

    applicationPeriodEndDateInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.application_period_end_date'));
      }
    },

    applicationPeriodEndTimeInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.application_period_end_time'));
      }
    },

    publicationDayInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.publication_day'));
      }
    },

    applicationSubmissionInput: {
      get: function() {
        return this.findElement(this.by.model('advertisement.application_submission'));
      }
    },

    submit: {
      get: function() {
        return this.findElement(this.by.css('[ng-click="submit()"]'));
      }
    },

    publish: {
      get: function() {
       return this.findElement(this.by.css('[ng-click="toggle()"]'));
      }
    },


    addNew: {
      value: function(selectEmployer) {
        var page = this;
        page.findElement(page.by.linkText('Luo uusi')).click();

        if (selectEmployer) {
          page.employerInput(1);
        }

        page.titleInput.sendKeys('console.log([data], [...]) sign.update(data) buf.readDoubleLE(offset, [noAssert])');

        page.jobProfessionGroupInput(1);
        page.jobTypeInput(1);
        page.jobDurationInput(1);

        page.applicationSubmissionInput.sendKeys('socket.localAddress async.log(function, arguments) decipher.update(data, [input_encoding], [output_encoding])');

        return page.submit.click();
      }
    }


});