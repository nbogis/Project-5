
var initialLoc = [{
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
];

/************** Model *************/
var Places = function(data) {
	// kncockout binding
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.position.lat);
	this.lng = ko.observable(data.position.lng);
};

/************** ViewModel *************/
var ViewModel = function() {
	var self = this;

	/** 		Map Creation 		**/
	// create a map object 
	var option = {
		center: new google.maps.LatLng(55, 11),
		zoom: 5,
		mapTypeControl: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	// create a map
	var map = new google.maps.Map(document.getElementById('myMap'),option);
	
	/** 		Search Creation 		**/
	var input = document.getElementById('searchBar');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
	searchBox.setBounds(map.getBounds());
	});




	/** 		Markers Creation 		**/
	//create empty observable array for landmarks
	this.landmarks = ko.observableArray();

	// add all landmarks 
	initialLoc.forEach(function(place) {
		self.landmarks.push(new Places(place));
	});

	// for each item in intialLoc, create a marker
	self.landmarks().forEach(function(initialLoc) {
		// create a marker
		var latLong = new google.maps.LatLng(initialLoc.lat(),initialLoc.lng());
		var marker = new google.maps.Marker({
			position: latLong,
			map: map,
			// draggable: true,
			title: initialLoc.name()
		});
	});

	self.landmarks.push(new Places({
		name: 'Fifi',
		position: {lat: 50, lng: 10}
	}));
	// this.currentPlace = ko.observable(this.landmarks()[0]);
}
// bind elements in ViewModel
ko.applyBindings(new ViewModel());

