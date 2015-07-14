var fitnessApp = {
	
	params : {
		pushups : {
			pushupsLoop 	: null,
			prevProximity 	: null,
		},
		squats : {
			prevX : 0,
			noise : 5.0,
			squatsLoop : null
		},	
		templates : {
			modal_template	: null,
			counter_template: null
		},
		beep : null
	},

	navigateToCounter : function( e ){
		e.preventDefault();
		
		var type = $(this).data('fitness-type'),
			content = fitnessApp.params.templates.counter_template({ type : type });			
		
		$('#fitnessCounter').html( content );
		$('#fitnessCounter').trigger( "create");
		$.mobile.navigate('#fitnessCounter');
	},

	saveRecord : function( type, value ){
		var maxVal = localStorage.getItem( type+'Max' ),
			modal_content = null,
			data = {
				message : 'Dobra robota! Praktyka czyni mistrza',
				button_txt : 'Zamknij',
				record : false
			};

		if( maxVal < value ){
			localStorage.setItem( type+'Max', value );
			data.message= '<img src="img/Trophy-100.png" alt="record"><br>Pobiłeś swój własny rekord!',
			data.record = true
		} 
		modal_content = fitnessApp.params.templates.modal_template( data );
		$('#modalFitness').children('.modal-dialog').html( modal_content);
		$('#modalFitness').modal();
	},

	startPushups : function( e ){
		$('#startPushups').hide();
		$('#stopPushups').show();
		
		navigator.proximity.enableSensor();
		fitnessApp.params.pushups.pushupsLoop = setInterval(function(){
	        navigator.proximity.getProximityState(function( state ){
	        	
			    if( fitnessApp.params.pushups.prevProximity && !state ){
					fitnessApp.increaseAmount();
			    }
			    fitnessApp.params.pushups.prevProximity = state;
	        });
	    }, 100);
	},

	stopPushups : function( e ){
		clearInterval(fitnessApp.params.pushups.pushupsLoop);
		navigator.proximity.disableSensor();
		$('#stopPushups').hide();
		$('#startPushups').show();
		fitnessApp.saveRecord('pushups', parseInt( $('.count').text()) );
	},

	startSquats : function( e ){
		$('#startSquats').hide();
		$('#stopSquats').show();

		var options = { frequency: 100 };

	     fitnessApp.params.squats.squatsLoop = navigator.accelerometer.watchAcceleration( function( a ){
	        var x = a.x - 9.81;
	            delta = Math.abs( fitnessApp.params.squats.prevX - x );

	        if( delta < fitnessApp.params.squats.noise ) return;


	        if( fitnessApp.params.squats.prevX < 0 && x > 0 ) {
	            fitnessApp.increaseAmount();
	        }

	        fitnessApp.params.squats.prevX = x;

	    },function(){
	        alert( 'Nie można uruchomić czujnika ruchu');
	    },options);		
	},

	stopSquats : function( e ){
		navigator.accelerometer.clearWatch( fitnessApp.params.squats.squatsLoop );
		$('#stopSquats').hide();
		$('#startSquats').show();
		fitnessApp.saveRecord('squats', parseInt( $('.count').text()) );
	},

	increaseAmount : function(){
	    $('.count').text( parseInt( $('.count').text() ) + 1 );
    	fitnessApp.params.beep.stop();
    	fitnessApp.params.beep.play();	    
	},

	navigateToMain : function(){
		$.mobile.navigate('#mainPage');
	},

	goBack : function( e ){
		if($.mobile.activePage.attr('id') == 'mainPage'){
			navigator.app.exitApp();
		} else {
			fitnessApp.navigateToMain();
		}
	},

	init: function(){

		setTimeout(function() {
	        navigator.splashscreen.hide();
	    }, 3000);
		
		this.params.beep = new Media('/android_asset/www/assets/beep.mp3', null, null, null);

		$('.ico-nav').on('click', fitnessApp.navigateToCounter );
		this.params.templates.counter_template = Handlebars.compile( $("#counter-template").html() );
		this.params.templates.modal_template = Handlebars.compile( $("#modal-template").html() );
		$(document).on('click', '#startSquats', this.startSquats );
		$(document).on('click', '#stopSquats', this.stopSquats );
		$(document).on('click', '#startPushups', this.startPushups );
		$(document).on('click', '#stopPushups', this.stopPushups );		
		$('#modalFitness').on('hidden.bs.modal', fitnessApp.navigateToMain );
		document.addEventListener("backbutton", fitnessApp.goBack, false);
	}

}