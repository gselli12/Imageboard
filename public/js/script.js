(() => {
    Handlebars.templates = Handlebars.templates || {};

    var templates = document.querySelectorAll('template');

    Array.prototype.slice.call(templates).forEach((tmpl) => {
        Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
    });

    Handlebars.partials = Handlebars.templates;

    var HomeView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
        },
        render: function() {
            var data = this.model.toJSON();
            console.log("data", data);
            var html = Handlebars.templates.images(data);
            this.$el.html(html);
            console.log("html", html);
        }
    });

    var UploadView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html(Handlebars.templates.upload({}))
        },
        events: {
            'click button': function(e) {
                this.model.set({
                    title: this.$el.find("input[name='title']").val(),
                    file: this.$el.find("input[type='file']").prop('files')[0]
                }).save();
            }
        }
    });

    // var imageView = Backbone.View.extend({
    //     initialize: function() {
    //         this.render();
    //     },
    //     render: function() {
    //         this.$el.html(Handlebars.templates.image({}));
    //     },
    // })


    var HomeModel = Backbone.Model.extend({
        initialize: function(){
            this.fetch();
        },
        url: '/home'
    });

    var UploadModel = Backbone.Model.extend({
        url: '/upload',
        initialize: function() {
            this.fetch();
        },
        save: function() {
            var formData = new FormData();

            formData.append('file', this.get('file'));
            formData.append('title', this.get('title'));

            var model = this;
            $.ajax({
                url: this.url,
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function() {
                    model.trigger('uploadSuccess');
                }
            });
        }
    });

    // var imageModel = Backbone.Model.extend({
    //     url: "/image/:id",
    //     initialize: function() {
    //         this.fetch();
    //     }
    // })



    const Router = Backbone.Router.extend({
        routes: {
            'upload': 'upload',
            '': 'home'
        },
        home:function(){
            console.log("home");
            new HomeView({
                el: '#main',
                model: new HomeModel
            });
        },
        upload: function() {
            new UploadView({
                el: '#uploaddiv',
                model: new UploadModel
            });
        }
    });


    var router = new Router();

    Backbone.history.start();


})();
