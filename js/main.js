(function() {
	window.Main = {
		Models: {},
		init: function() {
			var self = this;
			self.doneLoading = false;
			self.offset = 0;
			self.albumTrackKeys = {}; // Maps album id with associated Track keys
			R.ready(function() {
				// R.player.play({source: "a3032151"}); // Alice In Chains - The Devil Put Dinosaurs Here
				if (R.authenticated()) {
					self.loadCollection();
				} else {
					R.authenticate();
				}
			});
		},

		// This function will incrementally fetch and display 10 albums 
		// from the users collection until the entire catalog is loaded
		loadCollection: function() {
			var self = this;
			R.request({
				method: "getAlbumsInCollection",
				content: {
					user: R.currentUser.get("key"),
					start: self.offset,
					count: 10,
					sort: 'name'
				},
				complete: function(response) {
					if (response.result.length < 10) {
						self.doneLoading = true;	
					}
					for (var i=0; i < response.result.length; i++) {
						var $img = $("<img />", {
							"src": response.result[i].icon, 
							"id": response.result[i].albumKey, 
							"title": response.result[i].artist + " - " + response.result[i].name
						});
						$img.on("click", self.deleteAlbum);
						$("#collection").append($img);
						self.offset += 1;
					}
					if (self.doneLoading === false) {
						self.loadCollection();
					} else {
						alert("done loading");
					}
				}
			});
		}, 

		deleteAlbum: function() {
			$(this).css('opacity', 0.3);
		}
	};
	
	$(document).ready(function() {
		Main.init();
	});

})();
