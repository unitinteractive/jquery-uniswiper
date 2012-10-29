/*
 * jQuery Uniswiper
 * Add sliding gallery functionality, including touch swiping, to a group of items
 * Touch swiping requires jquery TouchSwipe - https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 *
 * @version     0.1
 * @copyright   2012 Unit Interactive, LLC - UnitInteractive.com
 * @author      R.A. Ray - RobertAdamRay.com
 * @link        https://github.com/unitinteractive/uniswiper     
 *
 * Dual licensed under the MIT license and GPL license:
 * http://opensource.org/licenses/MIT
 * http://www.gnu.org/licenses/gpl.html
*/
( function( $ ) { 




	var UniSwiper = function( elem, opts )
	{
		var _this = this;

		// extend the default config
		var defaults 	= 	{
								list : 			'ul',
								prev : 			'.prev',
								next : 			'.next',
								map : 			'.map',
								threshold : 	{ x: 60, y: 200 },
								relativeTo : 	'left',
								startAt : 		'first',
								loop : 			false
							};
		this.config 	= 	$.extend( defaults, opts || {} );

		// properties and caching
		this.uniqueID 		= new Date();
		this.uniqueID 		= this.uniqueID.getTime();
		this.$elem 			= $( elem );
		this.$list 			= this.$elem.find( this.config.list );
		this.$items			= this.$list.children();
		this.$prev 			= this.$elem.find( this.config.prev );
		this.$next 			= this.$elem.find( this.config.next );
		this.$map 			= this.$elem.find( this.config.map );

		// finds the start position for the gallery
		// if a number is given use that, otherwise do we want to start at the last item or the middle item?
		// the first item, "0", is the default 
		this.curPos 		= typeof this.config.startAt === 'number' ? this.config.startAt :
								( this.config.startAt === 'last' ? this.$items.length - 1 : 
									( this.config.startAt === 'middle' ? Math.floor( this.$items.length / 2 ) : 0 ) );
		this.curLeft		= parseInt( this.$list.css( 'left' ) ) || 0;

		
		
		
		/* Performs the animation */
		this.swiper = function( dir, moves )
		{
			var move = 0;

			// move to the right
			if ( dir == 'next' )
			{
				// are we on the last item?
				if( _this.curPos == _this.$items.length - 1 )
				{
					// should we loop back?
					if( _this.config.loop )
					{
						// swipe all the way in the other direction
						return _this.swiper( 'prev', _this.curPos );
					}
					else
					{
						// give up
						return _this;
					}
					
				}

				var itemWidth 	= $( _this.$items[_this.curPos] ).outerWidth();
				var itemMargins = parseInt( $( _this.$items[_this.curPos] ).css( 'marginLeft' ) ) + parseInt( $( _this.$items[_this.curPos] ).css( 'marginRight' ) );

				move = ( itemWidth + itemMargins ) * moves * -1; 

				_this.curPos += moves;
			}

			// move to the left
			else if ( dir == 'prev' )
			{
				// are we on the first item?
				if( _this.curPos === 0 )
				{
					// should we loop back?
					if( _this.config.loop )
					{
						// swipe all the way in the other direction
						return _this.swiper( 'next', _this.$items.length - 1 );
					}
					else
					{
						// give up
						return _this;
					}
				}

				var itemWidth 	= $( _this.$items[_this.curPos - 1] ).outerWidth();
				var itemMargins = parseInt( $( _this.$items[_this.curPos - 1] ).css( 'marginLeft' ) ) + parseInt( $( _this.$items[_this.curPos - 1] ).css( 'marginRight' ) );

				move = ( itemWidth + itemMargins ) * moves;

				_this.curPos -= moves;
			}

			// set the new left position for future use
			_this.curLeft += move;
			
			// perform the animation
			_this.$list.animate( { left: _this.curLeft + 'px' }, 'fast' );

			return _this;
		};




		/* Add selected class to the appropriate map item */
		this.mapper = function()
		{
		 	_this.$map
		 		.children()
		 			.eq( _this.curPos )
						.addClass( 'selected' )
						.siblings()
							.removeClass( 'selected' );

			return _this;
		};




		/* Move the curPos item to proper place in the container (left, center, or right) */
		this.reorientor = function()
		{
		 	var contWidth 	= _this.$elem.outerWidth();
		 	var $item 		= $( _this.$items[_this.curPos] );
		 	var itemMargins = parseInt( $item.css( 'marginLeft' ) ) + parseInt( $item.css( 'marginRight' ) );
		 	var itemWidth 	= $item.outerWidth() + itemMargins;
		 	var itemLeft 	= $item.position().left;
		 	var moveTo 		= 0;

		 	switch( _this.config.relativeTo )
		 	{
		 		case 'left' :

		 			_this.curLeft = 0 - itemLeft;

		 			break;

		 		case 'center' :

		 			moveTo 			= ( contWidth / 2 ) - ( itemWidth / 2 );
		 			_this.curLeft	= moveTo - itemLeft;

		 			break;

		 		case 'right' :

		 			moveTo = contWidth - itemWidth;
		 			_this.curLeft = moveTo - itemLeft;

		 			break;
		 	}
		 	
		 	_this.$list.animate( { left: _this.curLeft + 'px' }, 'fast' );

		 	return _this;
		};




		/* Adds or removes disabled classes from next/prev buttons 
		   Actual disabling happens in swiper() - this is just for styling */
		this.buttoner = function()
		{
			// are we looping?
			if( ! _this.config.loop )
			{
				// are we on the first item?
				if( _this.curPos === 0 )
				{
					_this.$prev.addClass( 'disabled' );
				}

				// are we on the last item?
				else if( _this.curPos == _this.$items.length - 1 )
				{
					_this.$next.addClass( 'disabled' );
				}

				// we're in the middle so nothing is disabled
				else 
				{
					_this.$prev.removeClass( 'disabled' );

					_this.$next.removeClass( 'disabled' );
				}
			}

			return _this;
		};




		/* remove this uniswiper instance */
		this.destroyer = function()
		{
			_this.$elem
				// remove the uniswiperObj from relevant items' data
				.data( 'uniswiperObj', this )
			 	.find( _this.config.prev )
			 		.removeData( 'uniswiperObj' )
			 		.end()
			 	.find( _this.config.next )
			 		.removeData( 'uniswiperObj' )
			 		.end()
			 	.find( _this.config.map )
			 		.removeData( 'uniswiperObj' )
			 		.end()

			 	// remove all events from elem
			 	.off( '.uniswiper' + _this.uniqueID )

			 	// remove swiping
			 	.swipe( 'destroy' );

			 // unbind window events
			 $( window ).unbind( '.uniswiper' + this.uniqueID );

			 return _this;
		};




		/**
		 * Initialize
		 */
		this.$elem
			// add the uniswiperObj to relevant items' data
			.data( 'uniswiperObj', this )
		 	.find( this.config.prev )
		 		.data( 'uniswiperObj', this )
		 		.end()
		 	.find( this.config.next )
		 		.data( 'uniswiperObj', this )
		 		.end()
		 	.find( this.config.map )
		 		.data( 'uniswiperObj', this )
		 		.end()

		 	// prev button
		 	.on( 'click.uniswiper' + this.uniqueID, this.config.prev, function( e )
		 		{
		 			e.preventDefault();

		 			$( this )
		 				.data( 'uniswiperObj' )
		 					.swiper( 'prev', 1 )
		 					.mapper()
		 					.buttoner();
		 		}
		 	)

		 	// next button
		 	.on( 'click.uniswiper' + this.uniqueID, this.config.next, function( e )
		 		{
		 			e.preventDefault();

		 			$( this )
		 				.data( 'uniswiperObj' )
		 					.swiper( 'next', 1 )
		 					.mapper()
		 					.buttoner();
		 		}
		 	)

		 	// map clicking
		 	.on( 'click.uniswiper' + this.uniqueID, this.config.map + ' > *', function( e )
		 		{
		 			e.preventDefault();

		 			var $item 		= $( this );
		 			var swipeObj 	= $item.parent().data( 'uniswiperObj' );
		 			var newPos 		= $item.index();
		 			var moves;

		 			if( newPos > swipeObj.curPos )
		 			{
		 				moves = newPos - swipeObj.curPos;

		 				swipeObj
		 					.swiper( 'next', moves )
		 					.mapper()
		 					.buttoner();
		 			}
		 			else if ( newPos < swipeObj.curPos )
		 			{
		 				moves = swipeObj.curPos - newPos;

		 				swipeObj
		 					.swiper( 'prev', moves )
		 					.mapper()
		 					.buttoner();
		 			}
		 		}
		 	)

		 	// touch swiping
		 	.swipe(
		 		{
		 			swipeRight: function( e )
				 		{
				 			$( this )
				 				.data( 'uniswiperObj' )
				 					.swiper( 'prev', 1 )
				 					.mapper()
				 					.buttoner();
				 		},
		 			swipeLeft: function( e )
				 		{
				 			$( this )
				 				.data( 'uniswiperObj' )
				 					.swiper( 'next', 1 )
				 					.mapper()
				 					.buttoner();
				 		},
				 	timeThreshold: 1000
		 		}
		 	);

		this.resizeTimeout = false;

	 	$( window ).bind( 'resize.uniswiper' + this.uniqueID, function()
	 		{
	 			if( _this.resizeTimeout !== false )
	 			{
	 				clearTimeout( _this.resizeTimeout );
	 			}
	 			
	 			_this.resizeTimeout = setTimeout( _this.reorientor, 200 );
	 		}
	 	);

	 	// run reorientor() once, delay to allow css to load
	 	setTimeout( _this.reorientor, 16 );

		// run once
		this
			.mapper()
			.buttoner();
	};

	
	
	
	// construct
	$.fn.extend(
		{
			uniswiper : function( config )
						{
							return this.each( function()
								{
									new UniSwiper( this, config );
								}
							);
						}
		}
	);
})( jQuery );