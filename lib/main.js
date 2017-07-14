
/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	// Helper vars and functions.
	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	// from http://www.quirksmode.org/js/events_properties#position
	function getMousePos(e) {
		var posx = 0, posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return { x : posx, y : posy }
	}

	/**
	 * TiltFx obj.
	 */
	function TiltFx(el, options) {
		this.DOM = {};
		this.DOM.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this._init();
	}

	TiltFx.prototype.options = {
		movement: {
			imgWrapper : {
				translation : {x: 0, y: 0, z: 0},
				rotation : {x: -5, y: 5, z: 0},
				reverseAnimation : {
					duration : 1200,
					easing : 'easeOutElastic',
					elasticity : 600
				}
			},
			lines : {
				translation : {x: 10, y: 10, z: [0,10]},
				reverseAnimation : {
					duration : 1000,
					easing : 'easeOutExpo',
					elasticity : 600
				}
			},
			caption : {
				translation : {x: 20, y: 20, z: 0},
				rotation : {x: 0, y: 0, z: 0},
				reverseAnimation : {
					duration : 1500,
					easing : 'easeOutElastic',
					elasticity : 600
				}
			},
			/*
			overlay : {
				translation : {x: 10, y: 10, z: [0,50]},
				reverseAnimation : {
					duration : 500,
					easing : 'easeOutExpo'
				}
			},
			*/
			shine : {
				translation : {x: 50, y: 50, z: 0},
				reverseAnimation : {
					duration : 1200,
					easing : 'easeOutElastic',
					elasticity: 600
				}
			}
		}
	};

	/**
	 * Init.
	 */
	TiltFx.prototype._init = function() {
		this.DOM.animatable = {};
		this.DOM.animatable.imgWrapper = this.DOM.el.querySelector('.tilter__figure');
		this.DOM.animatable.lines = this.DOM.el.querySelector('.tilter__deco--lines');
		this.DOM.animatable.caption = this.DOM.el.querySelector('.tilter__caption');
		this.DOM.animatable.overlay = this.DOM.el.querySelector('.tilter__deco--overlay');
		this.DOM.animatable.shine = this.DOM.el.querySelector('.tilter__deco--shine > div');
		this._initEvents();
	};

	/**
	 * Init/Bind events.
	 */
	TiltFx.prototype._initEvents = function() {
		var self = this;

		this.mouseenterFn = function() {
			for(var key in self.DOM.animatable) {
				anime.remove(self.DOM.animatable[key]);
			}
		};

		this.mousemoveFn = function(ev) {
			requestAnimationFrame(function() { self._layout(ev); });
		};

		this.mouseleaveFn = function(ev) {
			requestAnimationFrame(function() {
				for(var key in self.DOM.animatable) {
					if( self.options.movement[key] == undefined ) {continue;}
					anime({
						targets: self.DOM.animatable[key],
						duration: self.options.movement[key].reverseAnimation != undefined ? self.options.movement[key].reverseAnimation.duration || 0 : 1,
						easing: self.options.movement[key].reverseAnimation != undefined ? self.options.movement[key].reverseAnimation.easing || 'linear' : 'linear',
						elasticity: self.options.movement[key].reverseAnimation != undefined ? self.options.movement[key].reverseAnimation.elasticity || null : null,
						scaleX: 1,
						scaleY: 1,
						scaleZ: 1,
						translateX: 0,
						translateY: 0,
						translateZ: 0,
						rotateX: 0,
						rotateY: 0,
						rotateZ: 0
					});
				}
			});
		};

		this.DOM.el.addEventListener('mousemove', this.mousemoveFn);
		this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
		this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
	};

	TiltFx.prototype._layout = function(ev) {
		// Mouse position relative to the document.
		var mousepos = getMousePos(ev),
			// Document scrolls.
			docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop},
			bounds = this.DOM.el.getBoundingClientRect(),
			// Mouse position relative to the main element (this.DOM.el).
			relmousepos = { x : mousepos.x - bounds.left - docScrolls.left, y : mousepos.y - bounds.top - docScrolls.top };

		// Movement settings for the animatable elements.
		for(var key in this.DOM.animatable) {
			if( this.DOM.animatable[key] == undefined || this.options.movement[key] == undefined ) {
				continue;
			}
			var t = this.options.movement[key] != undefined ? this.options.movement[key].translation || {x:0,y:0,z:0} : {x:0,y:0,z:0},
				r = this.options.movement[key] != undefined ? this.options.movement[key].rotation || {x:0,y:0,z:0} : {x:0,y:0,z:0},
				setRange = function (obj) {
					for(var k in obj) {
						if( obj[k] == undefined ) {
							obj[k] = [0,0];
						}
						else if( typeof obj[k] === 'number' ) {
							obj[k] = [-1*obj[k],obj[k]];
						}
					}
				};

			setRange(t);
			setRange(r);

			var transforms = {
				translation : {
					x: (t.x[1]-t.x[0])/bounds.width*relmousepos.x + t.x[0],
					y: (t.y[1]-t.y[0])/bounds.height*relmousepos.y + t.y[0],
					z: (t.z[1]-t.z[0])/bounds.height*relmousepos.y + t.z[0],
				},
				rotation : {
					x: (r.x[1]-r.x[0])/bounds.height*relmousepos.y + r.x[0],
					y: (r.y[1]-r.y[0])/bounds.width*relmousepos.x + r.y[0],
					z: (r.z[1]-r.z[0])/bounds.width*relmousepos.x + r.z[0]
				}
			};

			this.DOM.animatable[key].style.WebkitTransform = this.DOM.animatable[key].style.transform = 'translateX(' + transforms.translation.x + 'px) translateY(' + transforms.translation.y + 'px) translateZ(' + transforms.translation.z + 'px) rotateX(' + transforms.rotation.x + 'deg) rotateY(' + transforms.rotation.y + 'deg) rotateZ(' + transforms.rotation.z + 'deg)';
		}
	};

	window.TiltFx = TiltFx;

})(window);

$(document).ready(function(){

    $('.tabs_links .link').on('click', function() {
        if (!$(this).hasClass('active')) {
            $('.link').removeClass('active');
            $(this).addClass('active');
            $('.tabs_content .block').removeClass('active');
            $('.tabs_content .block[data-tab='+$(this).data('tab')+']').addClass('active');
        };
        return false;
    });



    // validation
    var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/,
        bool = false,
        bool_text = false,
        bool_phone = false,
        bool_email = false,
        input,
        val,
        funcValid = function () {
            $('form input').each(function(){
                input = $(this);
                val = $(this).val();
                if (input.hasClass('email_input')) {
                    if (!reg.test(val) || val == '') {
                        bool_email = false;
                        $(this).parents('.field').addClass('error');
                    } else {
                        bool_email = true;
                        $(this).parents('.field').removeClass('error');
                    }
                }
                if (input.hasClass('text_input')) {
                    if (val == '') {
                        $(this).parents('.field').addClass('error');
                        bool_text = false;
                    } else {
                        bool_text = true;
                        $(this).parents('.field').removeClass('error');
                    }
                }
                if (input.hasClass('phone_input')) {
                    if (val == '') {
                        $(this).parents('.field').addClass('error');
                        bool_phone = false;
                    } else {
                        bool_phone = true;
                        $(this).parents('.field').removeClass('error');
                    }
                }
                if (bool_text === false || bool_phone === false || bool_email === false) {
                    bool = false;
                } else {
                    bool = true;
                }
                console.log(bool_text +' -- ' + bool_phone +' -- ' + bool_email +' -- ' + bool);
            });
        }
	$("form").submit(function(){
	    funcValid();

	    if (!!bool) {
	      $.ajax({
	        type: "POST",
	        url: "/feedback.php",
	        data: $("#feedback").serialize(),
	        success: function (response) {
				$('.popup .content:eq(0)').hide();
				$('.popup .content:eq(1)').show();
			  	setTimeout(function () {
			  		$('body').removeClass('no_scroll');
  		        	$('.popup').removeClass('open');
			  	}, 3000);
	        }
	      });
    	}

	    return false;
  	});
    // blur input
	$('.popup input, .popup textarea, .popup .text').on('blur',function(){
	    if ($(this).hasClass('text')) {
	        tmpval = $(this).html();
            $(this).parents('.field').find('textarea').val(tmpval);
	    } else {
            tmpval = $(this).val();
        }
	    if(tmpval == '') {
	        $(this).parents('.field').removeClass('not-empty');
	    } else {
	        $(this).parents('.field').addClass('not-empty');
	    }
	});
    // focus input
    $('.popup input, .popup textarea, .popup .text').on('focus',function(){
        $(this).parents('.field').addClass('not-empty');
        $(this).parents('.field').removeClass('error');
    });


    $('[data-popupLink]').on('click',function(e){
		e.preventDefault();
		$('form input').each(function(){
			$('.popup .content:eq(1)').hide();
			$('.popup .content:eq(0)').show();
			$(this).val('');
			$('.not-empty').removeClass('not-empty error');
			$('.popup .text').text('');

		});
		$('.popup[data-popup="'+$(this).data('popuplink')+'"]').addClass('open');
		$('#menu_block .btn').css('opacity', '0');

		$('body').addClass('no_scroll');
		return false;
	});
    $('.popup .close, .popup .bg').on('click', function() {
        $('body').removeClass('no_scroll');
        $('.popup').removeClass('open');
        $('#menu_block .btn').css('opacity', '1');
    });



    $('#arrow').on('click',function(){
        if ($('#rotate_block').length) {
			functionCubeDown();
			functionCubeEnd();
		} else {
			$('body,html').animate({scrollTop: $('#full_screen').height()},800);
		}
    });


    var funcFullScreen = function () {
        $('#full_screen').height($(window).height());
    }
    funcFullScreen();
    $(window).resize(function(){
        funcFullScreen();
    });



	var services_func = (function(){
		if (!$('.services_block').hasClass('anim')) {
			$('.services_block').addClass('anim');
			$('.ico-branding').addClass('show');
			new Vivus('ico-branding', {duration: 100});
			setTimeout(function () {
				$('.ico-web').addClass('show');
				new Vivus('ico-web', {duration: 100});
				setTimeout(function () {
					$('.ico-mobile').addClass('show');
					new Vivus('ico-mobile', {duration: 100});
					setTimeout(function () {
						$('.ico-marketing').addClass('show');
						new Vivus('ico-marketing', {duration: 100});
						setTimeout(function () {
							$('.ico-analytics').addClass('show');
							new Vivus('ico-analytics', {duration: 100});
							setTimeout(function () {
								$('.ico-startup').addClass('show');
								new Vivus('ico-startup', {duration: 100});
								setTimeout(function () {
									$('.ico-outsourcing').addClass('show');
									new Vivus('ico-outsourcing', {duration: 100});
								}, timeSec);
							}, timeSec);
						}, timeSec);
					}, timeSec);
				}, timeSec);
			}, timeSec);
		}
	});
    var headerColor = (function(){
		$('[data-header]').each(function(){
			if ($(window).scrollTop() > $(this).offset().top - 60) {
				// console.log($(this).data('header'));
				// console.log($('#index_content').scrollTop() + ' - ' + $(this).offset().top);
				$('header').removeClass('dark light red');
				$('header').addClass($(this).data('header'));
			}
		});
	});

	if ($('#rotate_block').length) {
		$('header').removeClass('dark light red');
		$('header').addClass($('#full_screen').data('header'));
	} else {
		headerColor();
	}
    $('.animate_block').each(function(){
		if ($(window).scrollTop() >= ($(this).offset().top - $(window).height()/1.2) ) {
			$(this).addClass('go');
		}
	});
	var st,
		lastScrollTop = 0;
	$(window).scroll(function(){

		headerColor();

		if (!$('#rotate_block').length) {
	        $('.animate_block').each(function(){
				if ($(window).scrollTop() >= ($(this).offset().top - $(window).height()/1.2) ) {
		            $(this).addClass('go');
		        }
			});
		}
		if ($('.animate_blocks').length) {
	        $('.animate_block').each(function(){
				if ($(window).scrollTop() >= ($(this).offset().top - $(window).height()/1.2) ) {
		            $(this).addClass('go');
		        }
			});
		}

		if ($('.services_block').length) {
			if ($(window).scrollTop() >= ($('.services_block').offset().top - $(window).height()/1.2)) {
            	services_func();
			}
        }

	});

	// Cube
	if ($('#rotate_block').length) {
		$('body').addClass('cansel_top');
		var timerCube;
		$('#index_content').height($(window).height());
		$(window).resize(function(){
			$('#index_content').height($(window).height());
		});
		// куб при скролле вверх
		var functionCubeUp = function(){
			if ($(window).scrollTop() == 0) {
				$('#full_screen').removeClass('topBoxOut').addClass('topBoxIn');
				$('#index_content').addClass('bottomBoxOut').removeClass('bottomBoxIn');
				$('main').addClass('scroll_cube');
				$('header').removeClass('dark light red');
				$('header').addClass($('#full_screen').data('header'));
				$('#index_content').height($(window).height()).removeClass('auto_height');
				$('#rotate_block').removeClass('at_content');
				$('#rotate_main').removeClass('padding_on');
				$('footer').removeClass('show');
			}
		};
		// Куб при скролле вниз
		var functionCubeDown = function(){
			$('#full_screen').addClass('topBoxOut').removeClass('topBoxIn');
			$('#index_content').removeClass('bottomBoxOut').addClass('bottomBoxIn');
			$('main').addClass('scroll_cube');

			$('header').removeClass('dark light red');
			$('header').addClass($('#index_content').data('header'));

			if ($('.animate_blocks').length) {

				$('.animate_block').each(function(){
					if ($(window).scrollTop() >= ($(this).offset().top - $(window).height()/1.2) ) {
						$(this).addClass('go');
					}
				});
			}

			if ($(window).width() > 768) {
				if ($('.services_block').length) {
					setTimeout(function () {
						$('.services_block, .about_index .animate_block').addClass('go');
						services_func();
					}, 1600);
				}
			}
			setTimeout(function(){
				$('footer').addClass('show');
				$('#index_content').addClass('auto_height');
				$('#rotate_block').addClass('at_content');
				$('#rotate_main').addClass('padding_on');
				$('body').removeClass('cansel_top');
			},1700);
		};

		// Куб при скролле
		var functionCubeEnd = function(){
			timerCube = setTimeout(function () {
				$('main').removeClass('scroll_cube');
			}, 1700);
			setTimeout(function () {
				$('main').addClass('animate_blocks');
			}, 2000);
		};

		$(document).on('mousewheel DOMMouseScroll', function(event){
			if (!$('body').hasClass('no_scroll')) {
				if (!$('main').hasClass('scroll_cube')) {

					clearTimeout(timerCube);
					// console.log($('#index_content').scrollTop());
					if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
						// scroll up
						functionCubeUp();

					}
					else {
						// scroll down
						if ($('body').hasClass('load_end')) {
							functionCubeDown();
						}
					}

					functionCubeEnd();
				}
			}
		});



		$('body').on('touchstart', function(e){
			if (!$('body').hasClass('no_scroll')) {
	        	startTouch = e.changedTouches[0].pageY;
			}
	    });

		$('body').on('touchend', function(e){
	        if (!$('body').hasClass('no_scroll')) {
				endTouch = e.changedTouches[0].pageY;
		        if (endTouch > startTouch) {
					clearTimeout(timerCube);
					if (!$('body').hasClass('cansel_top')) {
						functionCubeUp();
						$('body').addClass('cansel_top');
					}
					functionCubeEnd();
				} else {
					clearTimeout(timerCube);
					if ($('body').hasClass('load_end')) {
						functionCubeDown();
					}
					functionCubeEnd();
				}
	        }
	    });

	} else {
		$('footer').addClass('show');
	}




    $('#menu_block .info p a').on('click',function(){
		$('body').removeClass('open_menu close_menu no_scroll');
		$('body').addClass('close_menu');
		if (('#contact_page').length) {
			map.setCenter({lat: 46.48768, lng: 30.73857});
			map.setZoom(17);
		}
	});
    $('.menu_btn').on('click',function(){
        if (!$('body').hasClass('open_menu')) {
            $('body').removeClass('open_menu close_menu no_scroll');
            $('body').addClass('open_menu no_scroll');
        } else {
            $('body').removeClass('open_menu close_menu no_scroll');
            $('body').addClass('close_menu');
        }
		headerColor();
    });



    // var tx, ty;
    // $('.portfolio_items .mousemove_item').on('mousemove',function(e){
    //     tx = e.offsetX;
    //     ty = e.offsetX;
    //     $(this).find('img').css('transform', 'translate(' + tx + 'px, ' + ty + 'px)');
    //     console.log(tx + ' - ' + ty);
    // });


    function svgAnimate1(){
		var animatingSvg = Snap('.animated__svg2'),
		lineSvg1 = animatingSvg.select('.line__svg__step1'),
		lineSvg2 = animatingSvg.select('.line__svg__step2'),
		lineSvg3 = animatingSvg.select('.line__svg__step3'),
		Rock1 = animatingSvg.select('.rock1'),
		Rock1_g = animatingSvg.select('.rock1_g'),
		Rock2 = animatingSvg.select('.rock2'),
		Rock2_g = animatingSvg.select('.rock2_g'),
		lineRock = animatingSvg.select('.line__under__rock'),
		Man3 = animatingSvg.select('#man3'),
		Box = animatingSvg.select('#box'),
		Cloud_item1 = animatingSvg.select('.cloud_item1'),
		Cloud_item2 = animatingSvg.select('.cloud_item2'),
		Cloud_item3 = animatingSvg.select('.cloud_item3'),
		Cloud_item4 = animatingSvg.select('.cloud_item4'),
		Text1 = animatingSvg.select('#text1'),
		Text2 = animatingSvg.select('#text2'),
		Text3 = animatingSvg.select('#text3');

	    lineSvg1.animate({'opacity':'1'},200).animate({'x2': lineSvg1.attr('data-x2'), 'x1': lineSvg1.attr('data-x1')}, 1000, mina.easeinout);
	    lineSvg2.animate({'opacity':'1'},200).animate({'x2': lineSvg2.attr('data-x2'), 'x1': lineSvg2.attr('data-x1')}, 1000, mina.easeinout);
	    lineSvg3.animate({'opacity':'1'},200).animate({'x2': lineSvg3.attr('data-x2'), 'x1': lineSvg3.attr('data-x1')}, 1000, mina.easeinout);
	    lineRock.animate({'opacity':'1'},200).animate({'transform': 't0 0'}, 1000, mina.easein, function(){
    		Rock2.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    		Rock2_g.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    		setTimeout(function() {
    			Rock1.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    			Rock1_g.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    			setTimeout(function(){
					Box.animate({'transform': 't0 0', 'opacity':'1'}, 400, mina.easein);
    			},200);
    			setTimeout(function(){
					Man3.animate({'transform': 't0 0', 'opacity':'1'}, 400, mina.easein, function(){
						Text1.animate({'opacity':'1'},200).animate({'rx': Text1.attr('data-rx'), 'ry': Text1.attr('data-ry')}, 200, mina.easein);
						setTimeout(function() {
							Text2.animate({'opacity':'1'},200).animate({'rx': Text2.attr('data-rx'), 'ry': Text2.attr('data-ry')}, 400, mina.easein, function(){
								Text3.animate({'opacity':'1'},200);
								showClouds2();
							});
						}, 100);
    				});
    			},400);
    		}, 100);
	    });

    	function showClouds2() {
    		Cloud_item1.animate({'opacity':'1'},2000).animate({transform: 't400 0'}, 15000);
			Cloud_item2.animate({'opacity':'1'},2000).animate({transform: 't400 0'}, 15000);
			Cloud_item4.animate({'opacity':'1'},2000).animate({transform: 't-350 0'}, 15000);
			Cloud_item3.animate({'opacity':'1'},2000).animate({transform: 't-400 0'}, 15000, function() {
    			hideClouds2();
    		});
    	}

    	function hideClouds2() {
    		Cloud_item1.animate({transform: 't-80 0'}, 15000);
    		Cloud_item2.animate({transform: 't0 0'}, 15000);
    		Cloud_item4.animate({transform: 't0 0'}, 15000);
    		Cloud_item3.animate({transform: 't70 0'}, 15000, function() {
    			showClouds2();
    		});
    	}
	}
    function svgAnimate2(){
		var animatingSvg = Snap('.animated__svg5'),
		lineSvg1 = animatingSvg.select('.line__svg__step1'),
		lineSvg2 = animatingSvg.select('.line__svg__step2'),
		lineSvg3 = animatingSvg.select('.line__svg__step3'),
		Rock1 = animatingSvg.select('.rock1'),
		Rock1_g = animatingSvg.select('.rock1_g'),
		Rock2 = animatingSvg.select('.rock2'),
		Rock2_g = animatingSvg.select('.rock2_g'),
		lineRock = animatingSvg.select('.line__under__rock'),
		Man9 = animatingSvg.select('#man9'),
		Man10 = animatingSvg.select('#man10'),
		Man11 = animatingSvg.select('#man11'),
		Girl = animatingSvg.select('#girl'),
		Cloud_item1 = animatingSvg.select('.cloud_item1'),
		Cloud_item2 = animatingSvg.select('.cloud_item2'),
		Cloud_item3 = animatingSvg.select('.cloud_item3'),
		Cloud_item4 = animatingSvg.select('.cloud_item4'),
		Text1 = animatingSvg.select('.text1'),
		Text2 = animatingSvg.select('.text2'),
		Text3 = animatingSvg.select('.text3');

	    lineSvg1.animate({'opacity':'1'},200).animate({'x2': lineSvg1.attr('data-x2'), 'x1': lineSvg1.attr('data-x1')}, 1000, mina.easeinout);
	    lineSvg2.animate({'opacity':'1'},200).animate({'x2': lineSvg2.attr('data-x2'), 'x1': lineSvg2.attr('data-x1')}, 1000, mina.easeinout);
	    lineSvg3.animate({'opacity':'1'},200).animate({'x2': lineSvg3.attr('data-x2'), 'x1': lineSvg3.attr('data-x1')}, 1000, mina.easeinout);
	    lineRock.animate({'opacity':'1'},200).animate({'transform': 't0 0'}, 1000, mina.easein, function(){
			Rock1.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
			Rock1_g.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    		setTimeout(function() {
    			Rock2.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    			Rock2_g.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    			setTimeout(function(){
					Man9.animate({'transform': 't0 0', 'opacity':'1'}, 400, mina.easein);
					setTimeout(function() {
						Man10.animate({'transform': 't0 0', 'opacity':'1'}, 400, mina.easein);
					}, 100);
					setTimeout(function() {
						Man11.animate({'transform': 't0 0', 'opacity':'1'}, 400, mina.easein);
					}, 300);
					setTimeout(function() {
						Girl.animate({'transform': 't0 220', 'opacity':'1'}, 400, mina.easein, function(){
							Text1.animate({'opacity':'1'},200).animate({'rx': Text1.attr('data-rx'), 'ry': Text1.attr('data-ry')}, 200, mina.easein);
							setTimeout(function() {
								Text2.animate({'opacity':'1'},200).animate({'rx': Text2.attr('data-rx'), 'ry': Text2.attr('data-ry')}, 400, mina.easein, function(){
									Text3.animate({'opacity':'1'},200);
									showClouds5();
								});
							}, 100);
	    				});
					}, 500);
    			},100);
    		}, 100);
	    });

    	function showClouds5() {
    		Cloud_item3.animate({'opacity':'1'},2000).animate({transform: 't350 0'}, 15000);
			Cloud_item1.animate({'opacity':'1'},2000).animate({transform: 't300 0'}, 15000);
			Cloud_item2.animate({'opacity':'1'},2000).animate({transform: 't-250 0'}, 15000);
			Cloud_item4.animate({'opacity':'1'},2000).animate({transform: 't-250 0'}, 15000, function() {
    			hideClouds5();
    		});
    	}

    	function hideClouds5() {
    		Cloud_item3.animate({transform: 't0 0'}, 15000);
    		Cloud_item1.animate({transform: 't0 0'}, 15000);
    		Cloud_item2.animate({transform: 't0 0'}, 15000);
    		Cloud_item4.animate({transform: 't70 0'}, 15000, function() {
    			showClouds5();
    		});
    	}
	}
	function svgAnimate3(){
		var animatingSvg = Snap('.animated__svg6'),
		lineSvg1 = animatingSvg.select('.line__svg__step1'),
		lineSvg2 = animatingSvg.select('.line__svg__step2'),
		lineSvg3 = animatingSvg.select('.line__svg__step3'),
		Rock1 = animatingSvg.select('.rock1'),
		Rock1_g = animatingSvg.select('.rock1_g'),
		Rock2 = animatingSvg.select('.rock2'),
		Rock2_g = animatingSvg.select('.rock2_g'),
		lineRock = animatingSvg.select('.line__under__rock'),
		Man12 = animatingSvg.select('#man12'),
		Girl2 = animatingSvg.select('#girl2'),
		Cloud_item1 = animatingSvg.select('.cloud_item1'),
		Cloud_item2 = animatingSvg.select('.cloud_item2'),
		Cloud_item3 = animatingSvg.select('.cloud_item3'),
		Cloud_item4 = animatingSvg.select('.cloud_item4');

	    lineSvg1.animate({'opacity':'1'},200).animate({'x2': lineSvg1.attr('data-x2'), 'x1': lineSvg1.attr('data-x1')}, 1000, mina.easeinout);
	    lineSvg2.animate({'opacity':'1'},200).animate({'x2': lineSvg2.attr('data-x2'), 'x1': lineSvg2.attr('data-x1')}, 1000, mina.easeinout);
	    lineSvg3.animate({'opacity':'1'},200).animate({'x2': lineSvg3.attr('data-x2'), 'x1': lineSvg3.attr('data-x1')}, 1000, mina.easeinout);
	    lineRock.animate({'opacity':'1'},200).animate({'transform': 't0 0'}, 1000, mina.easein, function(){
			Rock1.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
			Rock1_g.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    		setTimeout(function() {
    			Rock2.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    			Rock2_g.animate({'transform': 'm1 0 0 1 0 0'}, 800, mina.elastic);
    			setTimeout(function(){
					Man12.animate({'transform': 't0 0', 'opacity':'1'}, 400, mina.easein);
					setTimeout(function() {
						Girl2.animate({'transform': 't0 217', 'opacity':'1'}, 400, mina.easein, function(){
							showClouds6();
	    				});
					}, 100);
    			},100);
    		}, 100);
	    });

    	function showClouds6() {
    		Cloud_item3.animate({'opacity':'1'},2000).animate({transform: 't350 0'}, 15000);
			Cloud_item1.animate({'opacity':'1'},2000).animate({transform: 't300 0'}, 15000);
			Cloud_item2.animate({'opacity':'1'},2000).animate({transform: 't-250 0'}, 15000);
			Cloud_item4.animate({'opacity':'1'},2000).animate({transform: 't-250 0'}, 15000, function() {
    			hideClouds6();
    		});
    	}

    	function hideClouds6() {
			Cloud_item3.animate({transform: 't0 0'}, 15000);
    		Cloud_item1.animate({transform: 't0 0'}, 15000);
    		Cloud_item2.animate({transform: 't0 0'}, 15000);
    		Cloud_item4.animate({transform: 't70 0'}, 15000, function() {
				showClouds6();
			});
    	}
	}
	
// 	$(window).on('scroll', function () {
// 		var scrollHeight = -document.body.scrollTop*0.1;
// 		if (document.body.scrollTop > 3500 && document.body.scrollTop < 4800 ) {
//
// 			// $('.item-img').addClass(" show");
// 			// $('.item-img').addClass(" show");
// //	$( '.show' ).css( 'transform', 'translate(0,' + scrollHeight + 'px)');
// // 			console.log(document.body.scrollTop);
// 		} else {
// //			      $('.show').css( 'transform', 'translate(0,-100px)');
// // 			$('.item-img').removeClass("show");
// 		}
//
// 	});
	
	/// SAILICA 2////
	
		$(".tab-content").hide();
		$(".tab-content:first").show();

		$('ul.but li').click(function(){
			$(".tab-content").hide();

			var tab_id = $(this).attr('data-tab');
			$("#"+tab_id).fadeIn();
			$('ul.but li').removeClass('active');
			
			$(this).removeClass('active');
			// $('.tab-content').removeClass('current');
			$(this).addClass('active');
			// $("#"+tab_id).addClass('current animate slideInUp');
		});
	
	
		
	/* Extra class "tab_last"
	 to add border to right side
	 of last tab */
	// $('ul.tabs li').last().addClass("tab_last");
	
	
		

		
    var scroll = 0;
	var timeSec = 400;
    $(document).scroll(function () {
        scroll = $(document).scrollTop();
	       
        /// SAILICA 2////
        function addscroll(){
	        $( '.show' ).css( 'transform', 'translate(0,' + (scroll*(-0.005)+2000+scroll*(-0.5)) + 'px)');
	        $( '.show' ).css( 'transform', 'translate(0,' + (scroll*(-0.005)+2000+scroll*(-0.5)) + 'px)');
        }
	
	    
        // console.log("асстояние до картинки " + $('.item-img').offset().top);
        if ($('.container').length) {

			    $( ".item-img").each(function(i, item) {
			
				    if (scroll >= (($(item).offset().top))-$(window).height()/1.3 && scroll <= ($(item).offset().top + 600)) {
					    $(item).addClass('show');
					    $(item).addClass('slideInUp');
					    addscroll();
				    }
				    
			    });

        }
	   
        
        // COPY
	
	    // function addscroll(){
		 //    $( '.show' ).css( 'transform', 'translate(0,' + scroll*(-0.2) + 'px)');
	    // }
	    //
	    // // console.log("асстояние до картинки " + $('.item-img').offset().top);
	    // if ($('.container').length) {
	    //
		 //    $( ".item-img").each(function(i, item) {
			//     // console.log("расстояние до внутр картинки" + $(item).offset().top + ' номер' + i);
			//     if (scroll >= ($(item).offset().top - $(window).height()/1.3) && scroll <= ($(item).offset().top - $(window).height()/1.5+scroll*0.25)) {
			// 	    $(item).addClass('show');
			// 	    $(item).addClass('slideInUp');
			// 	    addscroll();
			//     }
			//     else{
			// 	    $(item).removeClass('show');
			// 	    // $(item).removeClass(' animated slideInUp');
			//     }
		 //    });
	    //
	    //
	    // }
	    
	    
	    
	    
	    ///COPY
     
     
     
     
     
     
     
     
     
	
	    /// SAILICA 2 END////
     
	    if ($('.ropedup').length) {
	    
			if (scroll >= ($('.ropedup .step1').offset().top - $(window).height()/1.5)) {
				
				if (!$('.ropedup .step1').hasClass('show')) {
					$('.ropedup .step1').addClass('show');
					svgAnimate1();
				}
			}
			if (scroll >= ($('.ropedup .step2').offset().top - $(window).height()/1.5)) {
				setTimeout(function(){
					if (!$('.ropedup .step2').hasClass('show')) {
						$('.ropedup .step2').addClass('show');
						svgAnimate2();
					}
				}, 600);
			}
			if (scroll >= ($('.ropedup .step3').offset().top - $(window).height()/1.5)) {
				setTimeout(function() {
					if (!$('.ropedup .step3').hasClass('show')) {
						$('.ropedup .step3').addClass('show');
						svgAnimate3();
					}
				}, 1200);
			}
		}

        if ($('.kidventica').length) {
			if (scroll >= ($('.block6 .item1').offset().top - $(window).height()/1.5)) {
				if (!$('.block6 .item1 svg').hasClass('animate_svg_kid')) {
					$('.block6 .item1 svg').addClass('animate_svg_kid');
				}
			}
			if (scroll >= ($('.block6 .item2').offset().top - $(window).height()/1.5)) {
				// setTimeout(function(){
					if (!$('.block6 .item2 svg').hasClass('animate_svg_kid')) {
						$('.block6 .item2 svg').addClass('animate_svg_kid');
					}
				// }, 600);
			}
			if (scroll >= ($('.block6 .item3').offset().top - $(window).height()/1.5)) {
				// setTimeout(function() {
					if (!$('.block6 .item3 svg').hasClass('animate_svg_kid')) {
						$('.block6 .item3 svg').addClass('animate_svg_kid');
					}
				// }, 1200);
			}
		}
    });

});

$(window).on('load', function(){
    setTimeout(function () {
        $('body').addClass('load_end').removeClass('no_scroll');
        setTimeout(function () {
            var timerWord = null;
            var time = 100;
            $('.load_word').each(function(){
                var $this = $(this);
                timerWord = setTimeout(function () {
                    $this.addClass('animate');
                }, time += 210);
            });
        }, 300);
    }, 700);
	// карта
	var hashMap = window.location.hash;
	if (hashMap == '#odessa') {
		map.setCenter({lat: 46.48768, lng: 30.73857});
		map.setZoom(17);
	}
});
