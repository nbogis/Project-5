/************** Model *************/
// format of the locations match google maps locations
var initialLoc = [
	{
		name: 'Kaaba',
		geometry: {
			location: {
				lat: 21.422470,
				lng: 39.826207
			}
		}

	},
	{
		name: 'Hira Cave',
		geometry: {
			location: {
			lat: 21.457357,
			lng: 39.858936
			}
		}
	},
	{
		name: 'Mecca',
		geometry: {
			location: {
				lat: 21.389082,
				lng: 39.857912
			}
		}
	},
	{
		name: 'Jeddah',
		geometry: {
			location: {
				lat: 21.285407,
				lng: 39.237551
			}
		}
	},
	{
		name: 'Ash-Shafa',
		geometry: {
			location: {
				lat: 21.074424,
				lng: 40.324176
			}
		}
	}
];

var Items = function(data) {
	this.name = ko.observable(data.name);
	this.geometry = ko.observable(data.geometry.location);
};

//global for map
var app = app || {};
app.map, app.infowindow;
app.text = [];
app.markers = [];
app.icon = [{
    url: "icon.png", // image url
	    scaledSize: new google.maps.Size(40, 40), // scaled icon size
	},
	{
		url: "icon2.png", // image for initila locations
	    scaledSize: new google.maps.Size(40, 40), 
	}
];

/************** ViewModel *************/
var ViewModel = function() {
    var self = this;

    // add the initial locations to the list
    this.favPlaces = ko.observableArray([]);
    initialLoc.forEach(function(loc) {
    	self.favPlaces.push(new Items(loc));
    })

    // start the elements of the custom bind with deafulats values

    // register the binding using a binding handler
    ko.bindingHandlers.map= {
    	init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
	    	makeMap();

	    	// create markers from the locations we have in initialLoc
	  //   	var names = [];

	  		// start info window
			app.infowindow = new google.maps.InfoWindow();
	  //   	for (var i=0; i < initialLoc.length; i++) {
			// 	createMarker(initialLoc[i],app.icon[1]);
		 //    }
		},
    	update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var input = document.getElementById('mySearch');

			var options = {
			  bounds: app.map.getBounds(),
			};

			// add searchBox to extend prediction since autocomplete is very strict
			var searchBox = new google.maps.places.SearchBox(input);

			// Bias the SearchBox results to the current viewport
			app.map.addListener('bounds_changed', function() {
				searchBox.setBounds(app.map.getBounds());
			});

			// Listen for the event fired when the user selects a prediction and retrieve
			  // more details for that place.
			searchBox.addListener('places_changed', function() {
				var places = searchBox.getPlaces();
				var marker;
				if (places.length > 0) {
					places.forEach(function(place) {
						marker = createMarker(place,app.icon[0]);
						app.markers.push(marker);
					})
				}
				else {
					alert('Sorry we couldn\'t find matching locations')
				}

		    });
		}
	};

	// function to start a map with zoom of 3, centered at 19.67 and 44.15 (my home city), and with ROADMAP view
	var makeMap = function(){    
	    var myOptions = {
	        zoom: 8,
	        center: new google.maps.LatLng(21.074424,40.324176),
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    var myMap = document.getElementById("map");
	    app.map = new google.maps.Map(myMap, myOptions);
	};

	this.showInitLoc = function(clickedLoc) {
		// createMarker(clickedLoc,app.icon[1]);
		var location = clickedLoc.geometry();
	    var marker = new google.maps.Marker({
	        map: app.map,
	        animation: google.maps.Animation.DROP,
	        position: location,
	        icon: app.icon[1]
	    });
	    app.markers.push(marker);
	    // add to the inital locations list
	    // self.favPlaces.push(new Items({name: clickedLoc.name(),geometry:clickedLoc.geometry()}));

	    // show infoWindow when the marker is clicked
		google.maps.event.addListener(marker, 'click', function() {
			// add animation to markers when they are clicked and not animated
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}

			// show infowindow
			var text = '<div><strong>'+ clickedLoc.name();
			if (clickedLoc.formatted_address) {
				text = text + '</strong><br>'+clickedLoc.formatted_address;
			}
			// if (place.opening_hours){
			// 	app.text = app.text + place.opening_hours;
			// }
			// else {

			// }
			app.infowindow.setContent(text);
			// open the map with the info window
			app.infowindow.open(app.map, this);
		});
	};

	this.addToList = function() {
		// self.favPlaces.push(this)
	}

	clearMarks = function(){
    	if (app.markers.length > 0){
	    	for (var i = 0; i < app.markers.length; i++){
				app.markers[i].setMap(null); // Hide the markers
			}
		app.markers = []; // delete the markers
    	}
    }

	this.visibility = function(TrueFalse) {
		if (TrueFalse) {
			this.setMap(app.map);
		}
		else {
			this.setMap(null);
		}
	};

	var createMarker = function(place,icon) {
		var location = place.geometry.location;
	    var marker = new google.maps.Marker({
	        map: app.map,
	        animation: google.maps.Animation.DROP,
	        position: location,
	        icon: icon
	    });

	    // run event when a marker is clicked
	    google.maps.event.addListener(marker, 'click', function() {
	    	// set the info window to have info about the clicked place
			// add animation to markers when they are clicked
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}

		// show infowindow
			var text = '<div><strong>'+place.name;
			if (place.formatted_address) {
				text = text + '</strong><br>'+place.formatted_address;
			}
		// if (place.opening_hours){
		// 	app.text = app.text + place.opening_hours;
		// }
		// else {

		// }
		    app.infowindow.setContent(text);
		    // open the map with the info window
		    app.infowindow.open(app.map, this);
		});
		return marker;
		
	};
};





var viewModel = new ViewModel();
ko.applyBindings(viewModel);

