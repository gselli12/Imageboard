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
            //console.log("data", data);
            var html = Handlebars.templates.images(data);
            this.$el.html(html);
            //console.log("html", html);
        }
    });

    var HomeModel = Backbone.Model.extend({
        initialize: function(){
            this.fetch();
        },
        url: '/home'
    });


    var UploadView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html(Handlebars.templates.upload({}))
        },
        events: {
            'click': function() {
                var scroll = $(window).scrollTop();
                this.$el.empty();
                location.hash = "";
                $(window).scrollTop(scroll);
            },
            'click .close': function() {
                var scroll = $(window).scrollTop();
                this.$el.empty();
                location.hash = "";
                $(window).scrollTop(scroll);
            },
            'click button': function() {
                this.model.set({
                    title: this.$el.find("input[name='title']").val(),
                    file: this.$el.find("input[type='file']").prop('files')[0],
                    username: this.$el.find("input[name='username']").val(),
                    description: this.$el.find("input[name='description']").val(),
                }).save();
            },
            'click #upload-screen': function(e) {
                e.stopPropagation();
            }
        }
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
            formData.append('username', this.get('username'));
            formData.append('description', this.get('description'));

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


    var ImageView = Backbone.View.extend({
        initialize: function() {
            console.log("initialize");
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
        },
        render: function() {
            console.log("render");
            var data = this.model.toJSON();

            console.log("data", data);
            let html = Handlebars.templates.image(data);
            this.$el.html(html);
            console.log(html);
        },
        events: {
            'click': function() {
                var scroll = $(window).scrollTop();
                this.$el.empty();
                location.hash = "";
                $(window).scrollTop(scroll);
            },
            'click .close': function() {
                var scroll = $(window).scrollTop();
                this.$el.empty();
                location.hash = "";
                $(window).scrollTop(scroll);
            },
            'click .single-image-div': function(e) {
                e.stopPropagation();
            }
        }
    });

    var ImageModel = Backbone.Model.extend({
        url: function() {
            return `/images/${this.get('id')}`;
        },
        initialize: function() {
            this.fetch();
        }
    });



    const Router = Backbone.Router.extend({
        routes: {
            'upload': 'upload',
            '': 'home',
            'images/:id': 'image'
        },
        initialize: function(){
            if(location.hash == '#upload') {
                this.home();
            }
            else if (location.hash.indexOf("#images") !== -1) {
                this.home();
            }

        },
        home:function(){
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
        },
        image: function(id) {
            new ImageView({
                el: '#imagediv',
                model: new ImageModel({
                    id: id
                })
            });
        }
    });


    var router = new Router();

    Backbone.history.start();


})();
