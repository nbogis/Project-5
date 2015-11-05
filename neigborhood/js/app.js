
var initialLoc = {
	locations: ko.observableArray([
		{
			name: 'Johnny',
			position: {lat: 50, lng: 12}
		},
		{
			name: 'Nidu',
			position: {lat: 55, lng: 11}
		},
		{
			name: 'Dudu',
			position: {lat: 54, lng: 10}
		},
		{
			name: 'Ihdu',
			position: {lat: 57, lng: 13}
		}
	])
};

/************** Model *************/
var Places = function(data) {
	// kncockout binding
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.position.lat);
	this.lng = ko.observable(data.position.lng);
};

/************** ViewModel *************/
//global for map
var map;

// Start the vew model with (21,39). Latitude and longtitude variable are bounded to the search bar
var ViewMovel = function() {
    var self = this;
    self.lat = ko.observable(21);
    self.lng = ko.observable(39);
};

// function to start a map with zoom of 3, centered at 21 and 39 (my home city), and with ROADMAP view
var makeMap = function(){    
    var elevator;
    var myOptions = {
        zoom: 3,
        center: new google.maps.LatLng(21, 39),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var myMap = document.getElementById("map");
    map = new google.maps.Map(myMap, myOptions);
};

// create a custom binding called map. This binds <div data-bind="latitude: viewModel.lat, longitude:viewModel.lng, map:map" ></div>
// 
ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    	var Latitude = allBindingsAccessor().latitude();
    	var Longtitude = allBindingsAccessor().longitude();
    	// create a marker
        var LatLng = new google.maps.LatLng(Latitude, Longtitude);
        // marker will be on the map we specified earlier with a position from inputs
        var marker = new google.maps.Marker({
            map: allBindingsAccessor().map,
            position: LatLng,
            title: "My Map"
        });
        // save the marker storing marker to a new variable inside the viewModel called mapMarker. 
        // This is necessary to be used when updating the marker
        viewModel.mapMarker = marker;
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    	var Latitude = allBindingsAccessor().latitude();
    	var Longtitude = allBindingsAccessor().longitude();

        var latlng = new google.maps.LatLng(Latitude, Longtitude);

        // set marker position to the new position
        viewModel.mapMarker.setPosition(latlng);
    }
};


var viewModel = new ViewMovel();
makeMap();
ko.applyBindings(viewModel);


	/*
	// var self = this;

	// /** 		Markers Creation 		**/

	// // //create empty observable array for landmarks
	// // this.landmarks = ko.observableArray();

	// // // add all landmarks 
	// // initialLoc.locations.forEach(function(place) {
	// // 	self.landmarks.push(new Places(place));
	// // });

	// // self.landmarks.push(new Places({
	// // 	name: 'Fifi',
	// // 	position: {lat: 50, lng: 10}
	// // }));


	// /** 		Search Creation 		**/
	// var input = document.getElementById('searchBar');
	// self.value = ko.observable(input.value);

	// ko.bindingHandlers.marker = {
	// 	init: function(element, valueAccessor) {
	// /** 		Map Creation 		**/
	// 		var accessor = valueAccessor();
	// 		// create a map object 
	// 		var option = {
	// 			center: new google.maps.LatLng(55, 11),
	// 			zoom: 5,
	// 			mapTypeControl: true,
	// 			mapTypeId: google.maps.MapTypeId.ROADMAP
	// 		};
	// 		// create a map
	// 		var map = new google.maps.Map(element,option);
	// 		console.log(accessor.locations[0].name);
	// 		accessor.locations.forEach(function(location) {
	// 			var latLong = new google.maps.LatLng(location.position.lat(),location.position.lng());
	// 			var marker = new google.maps.Marker({
	// 				position: latLong,
	// 				map: map,
	// 				// draggable: true,
	// 				title: location.name()
	// 			});
	// 		});
	// 		// for each item in intialLoc, create a marker
	// 		// self.landmarks().forEach(function(initialLoc) {
	// 		// 	// create a marker
	// 		// 	var latLong = new google.maps.LatLng(initialLoc.lat(),initialLoc.lng());
	// 		// 	var marker = new google.maps.Marker({
	// 		// 		position: latLong,
	// 		// 		map: map,
	// 		// 		// draggable: true,
	// 		// 		title: initialLoc.name()
	// 		// 	});
	// 		// });
	// 	},
	// 	update: function(element, valueAccessor) {

	// 	}
		// update: function(input) {
		// 	var searchBox = new google.maps.places.SearchBox(input);

		// 	// get the user input 

		// 	// Bias the SearchBox results towards current map's viewport.
		// 	map.addListener('bounds_changed', function() {
		// 		searchBox.setBounds(map.getBounds());
		// 	});

		// 	var markers = [];
		// 	// Listen for the event fired when the user selects a prediction and retrieve
		// 	// more details for that place.
		// 	searchBox.addListener('places_changed', function() {
		// 		var places = searchBox.getPlaces();

		// 		if (places.length == 0) {
		// 			return;
		// 		}

		// 		// Clear out the old markers.
		// 		markers.forEach(function(marker) {
		// 			marker.setMap(null);
		// 		});

		// 		markers = [];

		// 		// For each place, get the icon, name and location.
		// 		var bounds = new google.maps.LatLngBounds();
		// 		places.forEach(function(place) {
		// 			var icon = {
		// 				url: place.icon,
		// 				size: new google.maps.Size(71, 71),
		// 				origin: new google.maps.Point(0, 0),
		// 				anchor: new google.maps.Point(17, 34),
		// 				scaledSize: new google.maps.Size(25, 25)
		// 			};

		// 			// Create a marker for each place.
		// 			markers.push(new google.maps.Marker({
		// 				map: map,
		// 				// icon: icon,
		// 				title: place.name,
		// 				position: place.geometry.location
		// 			}));

		// 			if (place.geometry.viewport) {
		// 				// Only geocodes have viewport.
		// 				bounds.union(place.geometry.viewport);
		// 			} 
		// 			else {
		// 				bounds.extend(place.geometry.location);
		// 			}
		// 		});
		// 		map.fitBounds(bounds);
		// 	});
		// }
	// }
	
	
	// this.currentPlace = ko.observable(this.landmarks()[0]);
// }
// // bind elements in ViewModel
// var viewModel = new ViewModel();
// ko.applyBindings(viewModel);

