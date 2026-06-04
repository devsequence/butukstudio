let map;
let marker;

function initMap() {
  const $pin = document.querySelector('.map-pin');
  if (!$pin) return;
  const mapStyles = [
    {
      elementType: "geometry",
      stylers: [{ color: "#f3efe6" }]
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b6b6b" }]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f3efe6" }]
    },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#e9e5dc" }]
    }
  ];

  const zoom = parseInt($pin.dataset.mapZoom) || 14;
  const coords = $pin.dataset.mapLang?.split(',') || [];
  const lat = parseFloat(coords[0]?.trim()) || 0;
  const lng = parseFloat(coords[1]?.trim()) || 0;
  const icon = $pin.querySelector('img')?.getAttribute('src') || null;

  const position = { lat, lng };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: zoom,
    center: position,
    disableDefaultUI: true,
    styles: mapStyles
  });

  marker = new google.maps.Marker({
    position: position,
    map: map,
    icon: icon,
    styles: mapStyles
  });
}
