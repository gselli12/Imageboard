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
            var html = Handlebars.templates.images(data);
            this.$el.html(html);
        },
    });

    var HomeModel = Backbone.Model.extend({
        initialize: function(){
            this.fetch();
        },
        url: '/home'
    });


    var UploadView = Backbone.View.extend({
        initialize: function() {
            this.model.on('uploadSuccess', function() {
                $('#uploaddiv').empty();
                location.hash = "";
            });
            this.render();
        },
        render: function() {
            this.$el.html(Handlebars.templates.upload({}));
            $('input[name=username]').focus();
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
            'keydown': function(e) {
                if(e.which == 27) {
                    var scroll = $(window).scrollTop();
                    this.$el.empty();
                    location.hash = "";
                    $(window).scrollTop(scroll);
                }
            },
            'click button': function() {
                this.model.set({
                    title: this.$el.find("input[name='title']").val(),
                    file: this.$el.find("input[type='file']").prop('files')[0],
                    username: this.$el.find("input[name='username']").val(),
                    description: this.$el.find("input[name='description']").val(),
                }).save();

                // var scroll = $(window).scrollTop();
                // this.$el.empty();
                // location.hash = "";
                // $(window).scrollTop(scroll);
            },
            'click #upload-screen': function(e) {
                e.stopPropagation();
            },
        }
    });

    var UploadModel = Backbone.Model.extend({

        initialize: function() {
            this.fetch();
        },
        url: '/upload',
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
                    console.log("uploadSuccess")
                    model.trigger('uploadSuccess');
                }
            });
        }
    });


    var ImageView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
            this.model.on('commentSuccess', function() {
                view.render();
            });
        },
        render: function() {
            console.log("render");
            var data = this.model.toJSON();
            let html = Handlebars.templates.image(data);
            this.$el.html(html);
            $('input[name=comment]').focus();
            $('.single-image').each(function() {
                var $this = $(this);
                let ratio = $this.width()/$this.height()
                if(ratio > 1.5) {
                    $this.addClass("landscape-pic");
                    $('.single-image-div').addClass("landscape-cont");
                } else if (1.5 >= ratio && ratio > 0.75) {
                    $this.addClass("square-pic");
                    $('.single-image-div').addClass("square-cont");
                    $('.leftImage').addClass("square-div");
                    $('.comments').addClass("square-comments");
                } else {
                    $this.addClass("portrait-pic");
                    $('.single-image-div').addClass("portrait-cont");
                    $('.leftImage').addClass("portrait-div");
                    $('.comments').addClass("portrait-comments");
                }
            });
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
            },
            'click button': function() {
                this.model.set({
                    comment: this.$el.find("input[name='comment']").val(),
                    username: this.$el.find("input[name='username']").val()
                }).save();
            },
            'keydown': function(e) {
                if(e.which == 27) {
                    var scroll = $(window).scrollTop();
                    this.$el.empty();
                    location.hash = "";
                    $(window).scrollTop(scroll);
                }
            },
        }
    });

    var ImageModel = Backbone.Model.extend({
        url: function() {
            let id = this.attributes.id;
            return('/images/' + id);
        },
        initialize: function() {
            this.fetch();
        },
        save: function() {
            var model = this;

            let data = {
                comment: model.get('comment'),
                username: model.get('username')
            };

            $.ajax({
                url: this.url(),
                method: 'POST',
                data: data,
                success: function() {
                    console.log("comment success");
                    model.trigger('commentSuccess');
                }
            });
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
            $('#main').off();
            new HomeView({
                el: '#main',
                model: new HomeModel
            });
        },
        upload: function() {
            $('#uploaddiv').off();
            new UploadView({
                el: '#uploaddiv',
                model: new UploadModel
            });
        },
        image: function(id) {
            $('#imagediv').off();
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

    $('.single-image').each(function() {
        var $this = $(this);
        if($this.width() > $this.height()) {
            $this.addClass("horizontal");
        } else {
            $this.addClass("vertical");
        }
    });


})();
