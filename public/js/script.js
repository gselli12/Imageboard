(() => {
    Handlebars.templates = Handlebars.templates || {};

    var templates = document.querySelectorAll('template');

    Array.prototype.slice.call(templates).forEach((tmpl) => {
        Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
    });

    Handlebars.partials = Handlebars.templates;

    var HomeModel = Backbone.Model.extend({
        initialize: function(){
            console.log("initialise");
            this.fetch();
        },
        url: '/home'
    });

    //let homeModel = new HomeModel();

    var HomeView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
        },
        render: function() {
            var data = this.model.toJSON();
            console.log("data", data.images);
            var html = Handlebars.templates.images(data);
            this.$el.html(html);
            //console.log("html", html);
        }
    });

    var homeView = new HomeView({
        el: '#main',
        model: new HomeModel()
    });

    // const Router = Backbone.Router.extend({
    //     routes: {
    //         '': 'home'
    //     },
    //     home:function(){
    //         homeView.render();
    //     }
    // });




})();
