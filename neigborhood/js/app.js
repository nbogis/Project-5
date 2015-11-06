/************** Model *************/
var initialLoc = {
	locations: ko.observableArray([
		{
			name: 'Kaaba',
			lat: 21.422470,
			lng: 39.826207
		},
		{
			name: 'Hira Cave',
			lat: 21.457357,
			lng: 39.858936
		},
		{
			name: 'Mecca',
			lat: 21.389082,
			lng: 39.857912
		},
		{
			name: 'Jeddah',
			lat: 21.285407,
			lng: 39.237551
		},
		{
			name: 'Ash-Shafa',
			lat: 21.074424,
			lng: 40.324176
		}
	])
};


/************** ViewModel *************/
//global for map
var app = app || {};
app.map;
app.infowindow;

app.icon = [{
	    url: "icon.png", // image url
	    scaledSize: new google.maps.Size(40, 40), // scaled icon size
	},
	{
		url: "icon2.png", // image for initila locations
	    scaledSize: new google.maps.Size(40, 40), 
	}];

// Start the vew model with (21,39). Latitude and longtitude variable are bounded to the search bar
var ViewModel = function() {
    var self = this;
    self.lat = ko.observable(21.88);
    self.lng = ko.observable(40.85278);
    self.mySearch = ko.observable("restaurants");
};

// function to start a map with zoom of 3, centered at 19.67 and 44.15 (my home city), and with ROADMAP view
var makeMap = function(){    
    var elevator;
    var myOptions = {
        zoom: 3,
        center: new google.maps.LatLng(19.67929,44.15278),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var myMap = document.getElementById("map");
    app.map = new google.maps.Map(myMap, myOptions);
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
            icon: app.icon[1],
            title: "My Map"
        });
        // save the marker storing marker to a new variable inside the viewModel called mapMarker. 
        // This is necessary to be used when updating the marker
        viewModel.mapMarker = marker;
    },
    // Latitude and longitude are stopred as string so need to convert them to int
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    	var Latitude = parseInt(allBindingsAccessor().latitude());
    	var Longtitude = parseInt(allBindingsAccessor().longitude());
    	var location = {lat: Latitude, lng: Longtitude};
        var Search = allBindingsAccessor().newSearch();

		console.log(typeof Search);	
        // set marker position to the new position
        var latlng = new google.maps.LatLng(Latitude, Longtitude);
        viewModel.mapMarker.setPosition(latlng);
        findPlaces(location, Search);
    }
};

var findPlaces = function(location, search) {
	app.infowindow = new google.maps.InfoWindow();

	// create a place service
	var service = new google.maps.places.PlacesService(app.map);
	service.textSearch({
		location: location,
		radius: 500,
		query: search
	}, callback); // call callback function when finish executing the search
};

var callback = function(results, status) {
	console.log(results);
	// check if we found some places
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		// removeAllMarker();
		// create a marker for each of the places found
	    for (var i = 0; i < results.length; i++) {
	      createMarker(results[i]);
	    }
	}
};

// remove all existing markers
// var removeAllMarker = function() {

// };

var createMarker = function(place) {
	console.log(place);
	var location = place.geometry.location;
    var marker = new google.maps.Marker({
        map: app.map,
        animation: google.maps.Animation.DROP,
        position: location,
        icon: app.icon[0]
    });
    // run event when a marker is clicked
    google.maps.event.addListener(marker, 'click', function() {
    	// set the info window to have info about the clicked place
	    app.infowindow.setContent(place.name);
	    // open the map with the info window
	    app.infowindow.open(app.map, this);
	});
};

var viewModel = new ViewModel();
makeMap();
ko.applyBindings(viewModel);

