//utils---------------------------------------
if(typeof Object.create!=="function"){
  Object.create = function(o){
    var F = function(){};
    F.prototype = o;
    return new F();
  };
}

if(!Array.indexOf){
  Array.prototype.indexOf = function(target){
    for(var i=0; i<this.length;i++){
      if(this[i]===target) return i;
    }

    return -1;
  };
}

jQuery.easing.easeInOutQuad = function (e, f, a, h, g) {
  if ((f /= g / 2) < 1) {
    return h / 2 * f * f + a;
  }
  return -h / 2 * ((--f) * (f - 2) - 1) + a;
};


jQuery.easing.easeOutQuad = function(e,f,a,h,g){
  return -h * (f /= g) * (f - 2) + a;
};

//flag and counter----------------------------
var current = 0;
var locked = true;

//parallax values------------------------------
var WIDTH = 1576;
var DURATION = 2000;
var DUR = 400;
var RATE = 3;

jQuery(function($){

//old ie ------------------------------------
if(/msie [6-8]/.test(navigator.userAgent.toLowerCase())){
  $.fn.extend({
    fadeIn: function(){
      var elem = $(this), arg = arguments;
      if(elem.attr("id")!="lightbox") elem.show(0, arg[arg.length-1]);
      else elem.css({display: "block", opacity: 0}).animate({opacity: 1.0}, arg);
    },

    fadeOut: function(){
      var elem = $(this), arg = arguments;
      elem.hide(0, arg[arg.length-1]);
    }
  });
}

//jquery extend ---------------------------------
  $.fn.extend({
    moveBg: function(distance, duration, fn){
      $(this).animate({backgroundPosition: distance}, duration, fn);
    }
  });

//elements---------------------------------------
  var mount = $("#mount");
  var ground = $("#ground .ground-top, #ground .ground-repeat");
  var building = $("#building");
  var main_contents = $("#main-contents");
  var footer = $("#main-footer");
  var global_nav = $("#global-nav");
  var arrow = $("#arrow-button"),
      arrow_left = arrow.find(".back"),
      arrow_right = arrow.find(".forward");

//array -------------------------------------
  var pages = [
    ["connection", "archive"],
    ["our-vision", "family"],
    ["tie-string", "learn-with", "support", "projects"]
  ];

//functions------------------------------------
  var create_object = function(obj, repeated){
    return Object.create(Objects(obj, repeated));
  };

  var is_page = function(href){
    var this_page;

    $.each(pages, function(i, val){
      if(val.indexOf(href)!==-1) this_page = i;
    });

    return this_page;
  };

  var preload_image = function(src){
    var pre_img = new Image();
    pre_img.src = src;
  };

  var set_rollover = function(){
    $(".hover").each(function(i){
      var img = $(this);

      if(img.data("src")) return;

      img.data({
        src: img.attr("src"),
        src_on: img.attr("src").replace(".png", "-on.png")
      });

      preload_image(img.data("src_on"));

      if(img.index("#global-nav img")===current)
        img.attr("src", img.data("src_on")).addClass("on");
    });
  };

  var highlight_nav = function(img){
    var on = global_nav.find(".on");

    if(locked || img.hasClass("on")) return false;

    img.attr("src", img.data("src_on")).addClass("on");
    on.attr("src", on.data("src")).removeClass("on");

    return true;
  };

  var onOff_arrow_nav = function(next){
    if(current===0) arrow_left.show();
    else if(next===0) arrow_left.hide();
  };

  var Distance = function(i){
    var diff_w = ($(window).width() - WIDTH) / 2;

    return {
      is_short: (-i * (WIDTH / RATE)) + diff_w,
      is_middle: (-i * WIDTH) + diff_w,
      is_long: (-i * (WIDTH * RATE)) + diff_w
    };
  };

  var parallax_slide = function(i){
    if(locked || current===i) return;
    locked = true;

    var distance = Distance(i);
    var duration = DURATION * Math.abs(current - i);

    onOff_arrow_nav(i);
    assemble_objects.hide(function(){
      setTimeout(function(){
        building.animate({left: distance.is_middle}, duration);
        rainbow.obj.animate({left: distance.is_short}, duration);

        mount.moveBg(distance.is_short, duration);
        ground.moveBg(distance.is_long, duration);
        footer.moveBg(distance.is_long, duration, function(){
          setTimeout(function(){
            current = i;
            locked = false;

            if(i===0) contents.opening();
            else assemble_objects.show(i);
          }, 200);
        });
      }, 300);
    });
  };

//objects---------------------------------------

  var Objects = function(obj, repeated){

    return {
      obj: obj,
      dur: DUR,
      easing: "swing",
      d: 200,
      timeout: null,

      show: function(i, fn){
        var self = this;

        if(repeated){
          self.obj.each(function(index){
            $(this).delay(index*self.d).fadeIn(self.dur, self.easing, function(){
              if(index===self.obj.length-1 && typeof fn==="function") fn();
            });
          });

        }else{
          self.obj.eq(i).fadeIn(self.dur, self.easing, fn);
        }
      },

      hide: function(fn){
        var self = this;
        self.obj.eq(current).stop(true).fadeOut(self.dur, self.easing, fn);
      },

      delay: function(d){
        var self = this;

        return {
          show: function(i, fn){
            self.timeout = setTimeout(function(){self.show(i, fn);}, d);
          }
        };
      },

      clear_queue: function(){
        clearTimeout(this.timeout);
      }
    };
  };

  var clouds = create_object($("#cloud img"));
  clouds.dur = 800;

  var stars = create_object(main_contents.find(".stars"));
  stars.dur = 800;

  var icons = create_object($("#top .icons li"), true);
  icons.timeout_arr = [];

  icons.show = function(){
    var index = Math.round(Math.random()*9);

    clearTimeout(icons.timeout_arr[index]);
    icons.timeout_arr[index] = setTimeout(icons.show, 300);

    if(icons.obj.eq(index).hasClass("lock")) return;

    icons.obj.eq(index).addClass("lock").fadeIn(800, function(){
      $(this).delay(2000).fadeOut(800, function(){
        $(this).removeClass("lock");
      });
    });
  };

  icons.hide = function(fn){
    icons.obj.stop(true, true).fadeOut(icons.dur, fn);
    $.each(icons.timeout_arr, function(i, val){
      clearTimeout(icons.timeout_arr[i]);
    });
  };

  var rainbow = create_object($("#rainbow"));

  rainbow.show = function(fn){
    rainbow.obj.fadeIn(DUR, fn);
  };

  rainbow.hide = function(fn){
    rainbow.obj.stop(true).fadeOut(rainbow.dur, fn);
  };

  var humans = create_object($("#humans div"));

  humans.show = function(index, fn){
    var person = humans.obj.eq(index).find("img");

    person.each(function(i){
      $(this).delay(i*150).fadeIn(DUR, "linear", function(){
        if(i===person.length-1 && typeof fn==="function") fn();
      });
    });
  };

  humans.hide = function(fn){
    humans.obj.eq(current).find("img").stop(true).fadeOut(DUR, fn);
  };

  var contents = create_object(main_contents.find(" > div"));
  contents.top = $("#top");

  contents.opening = function(){
    locked = true;

    assemble_objects.hide(function(){
      contents.top.show();
      contents.top.find("section").hide();

      humans.delay(300).show(0, function(){
        contents.top.find(".opening").delay(500).fadeIn(800, function(){
          clouds.show(0);

          $(this).delay(2000).fadeOut(800, function(){
            stars.delay(600).show(0);

            contents.top.find(".contents").delay(600).fadeIn(800, function(){
              icons.delay(500).show();
              thread.show();
              locked = false;
            });
          });
        });
      });
    });
  };

  contents.show = function(i, fn){
    contents.obj.eq(i).show();
    contents.obj.eq(i).find(".contents").fadeIn(DUR, fn);
  };

  contents.hide = function(fn){
    contents.obj.eq(current).find(".contents")
      .stop(true).fadeOut(DUR, function(){
        contents.obj.eq(current).hide();
        if(typeof fn==="function") fn();
      });
  };

  var connect = create_object($("#connect"));
  connect.title = connect.obj.find("h1"),
  connect.li = connect.obj.find("ul li");
  connect.float_timeout = [];

  connect.random_dur = function(){
    var t;
    switch(Math.floor(Math.random()*7)){
     case 0: t = 400; break;
     case 1: t = 450; break;
     case 2: t = 500; break;
     case 3: t = 550; break;
     case 4: t = 600; break;
     case 5: t = 650; break;
     case 6: t = 700; break;
    }

    return t;
  };

  connect.float_anim = function(li){
    var i = li.index();
    var d = connect.random_dur();

    clearTimeout(connect.float_timeout[i]);

    li.animate({marginTop: -5}, 550, "linear")
      .animate({marginTop: -10}, d, "easeOutQuad")
      .animate({marginTop: -5}, d, "linear")
      .animate({marginTop: 0}, 550, "easeOutQuad", function(){
        connect.float_timeout[i] = setTimeout(function(){connect.float_anim(li);}, 0);
      });
  };

  connect.stop_floating = function(){
    $.each(connect.float_timeout, function(i,val){
      connect.li.eq(i).stop(true);
      clearTimeout(val);
    });
  };

  connect.show = function(fn){
    connect.obj.css({opacity: 1.0}).show();
    connect.title.fadeIn(DUR, function(){
      connect.li.each(function(i){
        var li = $(this);

        li.delay(i*200).fadeIn(DUR, function(){
          connect.float_anim(li);
          if(i===connect.li.length-1 && typeof fn==="function") fn();
        });
      });
    });
  };

  connect.hide = function(fn){
    connect.obj.stop(true).fadeOut(DUR, function(){
      connect.title.stop(true).hide();
      connect.stop_floating();

      connect.li.stop(true, true).hide(0, function(){
        if($(this).index()===connect.li.length-1 && typeof fn==="function") fn();
      });
    });
  };

  var earth = create_object($("#earth-field"));
  earth.timeout = null;
  earth.sun = $("#sun");
  earth.background = $("#background");

  earth.show = function(){
    if(locked) return;
    locked = true;

    arrow_right.hide();
    onOff_arrow_nav(4);
    assemble_objects.hide();

    earth.sun.fadeOut(DUR, function(){
      earth.background.animate({bottom: -earth.background.height()}, 800, function(){
        earth.obj.animate({bottom: 30}, 800, function(){
          humans.delay(300).show(4, function(){
            earth.timeout = setTimeout(function(){
              connect.show(function(){
                stars.delay(100).show(4);
                thread.delay(100).show();
              });
            }, 300);
          });

          current = 4;
          locked = false;
        });
      });
    });
  };

  earth.hide = function(i){
    if(locked) return;
    locked = true;

    var distance = Distance(i);
    rainbow.obj.css({left: distance.is_short});
    building.css({left: distance.is_middle});

    mount.moveBg(distance.is_short, 0);
    ground.moveBg(distance.is_long, 0);
    footer.moveBg(distance.is_long, 0);

    connect.hide(function(){
      thread.clear_queue();
      thread.hide();
    });

    thread.clear_queue();
    humans.clear_queue();
    stars.clear_queue();
    clearTimeout(earth.timeout);

    thread.hide();
    humans.hide();
    arrow_right.show();
    onOff_arrow_nav(i);

    stars.hide(function(){
      earth.obj.animate({bottom: -earth.obj.height()}, 800, function(){
        earth.background.animate({bottom: 0}, 800, function(){
          earth.sun.stop(true).fadeIn(DUR);
          current = i;
          locked = false;

          if(i===0) contents.opening();
          else assemble_objects.show(i);
        });
      });
    });
  };

  var thread = create_object($("#thread-field"));
  thread.threads = thread.obj.find(" > div");
  thread.pen = connect.obj.find(".pen");
  thread.dur = 400;

  thread.pos = function(){
    return ($(window).width() - 4000)/2;
  };

  thread.top_pos = function(){
    return (($(window).width() - 1000) / 2) + 846;
  };

  thread.show = function(fn){
    var pos = current===0 ? 0 : thread.pos(),
        field_pos = current===0 ? thread.top_pos() : 0,
        duration = current===4 ? 4000 : 2800;

    thread.threads.eq(current).stop(true)
      .css({left: pos, opacity: 1}).show(0, function(){
        thread.obj.css({left: field_pos})
          .animate({width: $(window).width()}, duration, "linear", function(){
            if(current===4) thread.pen.fadeIn(300, fn);
            else if(typeof fn==="function") fn();
          });
      });
  };

  thread.hide = function(fn){
    var self = this;

    if(current===4) thread.pen.stop(true).fadeOut(DUR);

    thread.threads.eq(current).stop(true).fadeOut(self.dur, function(){
      thread.obj.stop(true).css({width: 0});
      if(typeof fn==="function") fn();
    });
  };

  thread.resize = function(){
    if(current===0) thread.obj.stop(true).css({left: thread.top_pos()});
    else thread.threads.eq(current).stop(true).css({left: thread.pos()});
  };


  var assemble_objects = {
    show: function(i){
      humans.delay(300).show(i, function(){
        if(i===0){
          contents.delay(300).show(i, function(){
            stars.delay(100).show(i);
            clouds.delay(100).show(i, function(){
              icons.delay(300).show();
              thread.show();
            });
          });

        }else{
          contents.delay(300).show(i, function(){
            stars.delay(100).show(i);
            clouds.delay(100).show(i, function(){
              thread.show();
            });
          });
        }
      });
    },

    hide: function(fn){
      stars.clear_queue();
      clouds.clear_queue();
      humans.clear_queue();
      contents.clear_queue();
      icons.clear_queue();

      humans.hide();
      thread.hide();
      if(current===0){
        icons.hide();
      }

      clouds.hide();
      stars.hide();
      contents.hide(fn);
    }
  };


//event----------------------------------------

  //rollover--------------------------
  $(document).on("mouseenter", ".hover", function(){
    var img = $(this);
    if(!img.hasClass("on")) img.attr("src", img.data("src_on"));

  }).on("mouseleave", ".hover", function(){
    var img = $(this);
    if(!img.hasClass("on")) img.attr("src", img.data("src"));
  });

  //click arrow-nav------------------
  arrow.on("click", "a", function(e){
    e.preventDefault();
    if(locked) return;

    var nav_len = global_nav.find("li").length,
        i = $(this).index("#arrow-button a"),
        next = i!==0 ?
          (current + 1) % nav_len : (current + nav_len - 1) % nav_len;
    var img = global_nav.find("img").eq(next);

    highlight_nav(img);

    if(next!==4 && current!==4) parallax_slide(next);
    else if(next===4) earth.show();
    else earth.hide(next);
  });

  //click gloval-nav-------------------
  global_nav.on("click", "a", function(e){
    var a = $(this), img = a.find("img"), i = a.index("#global-nav a");

    if(i===5) return;
    e.preventDefault();

    if(!highlight_nav(img)) return;

    if(i!==4 && current!==4) parallax_slide(i);
    else if(i===4) earth.show();
    else earth.hide(i);
  });

  //click logo-----------------------
  footer.on("click", ".logo a", function(e){
    e.preventDefault();
    if(locked) return;

    var img = global_nav.find("li:first img");

    highlight_nav(img);

    if(current===4) earth.hide(0);
    else if(current!==0) parallax_slide(0);
    else contents.opening();
  });

  //initialize-------------------------
  arrow_left.hide();
  building.width(building.find("img").length * WIDTH);
  set_rollover();

  //resize and onload--------------
  $(window).on("load", function(){
    setTimeout(contents.opening, 800);

  }).on("resize", function(){
    var pos = (-current * WIDTH) + (($(window).width() - WIDTH) /2);
    building.css({
      left: pos
    });

    rainbow.obj.css({
      left: pos
    });

    thread.resize();
  }).resize();
});



(function(){if(!/*@cc_on!@*/0)return;var e = "abbr,article,aside,audio,bb,canvas,datagrid,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(',');for(var i=0;i<e.length;i++){document.createElement(e[i]);}})();
