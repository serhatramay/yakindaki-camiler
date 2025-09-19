// Yakındaki Camiler Uygulaması
let map;
let userLocation;
let mosqueMarkers = [];

// İstanbul Taksim çevresindeki örnek camiler
const istanbulMosques = [
    {
        name: "Taksim Camii",
        lat: 41.0370,
        lng: 28.9857,
        address: "Gümüşsuyu, Taksim Meydanı, Beyoğlu/İstanbul"
    },
    {
        name: "Dolmabahçe Camii",
        lat: 41.0391,
        lng: 28.9988,
        address: "Dolmabahçe, Beşiktaş/İstanbul"
    },
    {
        name: "Nusretiye Camii",
        lat: 41.0428,
        lng: 28.9994,
        address: "Nusretiye, Tophane, Beyoğlu/İstanbul"
    },
    {
        name: "Galata Mevlevihanesi Camii",
        lat: 41.0256,
        lng: 28.9742,
        address: "Galata, Beyoğlu/İstanbul"
    },
    {
        name: "Kılıç Ali Paşa Camii",
        lat: 41.0431,
        lng: 28.9979,
        address: "Kemankeş Karamustafa Paşa, Tophane, Beyoğlu/İstanbul"
    },
    {
        name: "Şişhane Camii",
        lat: 41.0289,
        lng: 28.9751,
        address: "Şişhane, Beyoğlu/İstanbul"
    },
    {
        name: "Cihangir Camii",
        lat: 41.0318,
        lng: 28.9798,
        address: "Cihangir, Beyoğlu/İstanbul"
    },
    {
        name: "Kasımpaşa Camii",
        lat: 41.0456,
        lng: 28.9734,
        address: "Kasımpaşa, Beyoğlu/İstanbul"
    }
];

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
});

function initializeMap() {
    // Haritayı İstanbul Taksim merkezli olarak başlat
    map = L.map('map').setView([41.0370, 28.9857], 14);
    
    // OpenStreetMap katmanını ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Taksim'i işaretle
    L.marker([41.0370, 28.9857])
        .addTo(map)
        .bindPopup('🎯 Taksim Meydanı<br>Başlangıç noktanız')
        .openPopup();
}

function setupEventListeners() {
    document.getElementById('findMosques').addEventListener('click', findNearbyMosques);
    document.getElementById('currentLocation').addEventListener('click', getCurrentLocation);
}

function getCurrentLocation() {
    showLoading();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Haritayı kullanıcının konumuna odakla
                map.setView([userLocation.lat, userLocation.lng], 15);
                
                // Kullanıcının konumunu işaretle
                L.marker([userLocation.lat, userLocation.lng], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                })
                .addTo(map)
                .bindPopup('📍 Mevcut Konumunuz')
                .openPopup();
                
                hideLoading();
                alert('✅ Konumunuz başarıyla bulundu!');
            },
            function(error) {
                hideLoading();
                alert('❌ Konum alınamadı. Lütfen konum izni verin.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        hideLoading();
        alert('❌ Tarayıcınız konum hizmetlerini desteklemiyor.');
    }
}

function findNearbyMosques() {
    showLoading();
    
    // Önceki cami işaretlerini temizle
    mosqueMarkers.forEach(marker => map.removeLayer(marker));
    mosqueMarkers = [];
    
    // Kullanıcının konumu yoksa Taksim'i referans al
    const referenceLocation = userLocation || { lat: 41.0370, lng: 28.9857 };
    
    // Camileri mesafeye göre sırala
    const mosquesWithDistance = istanbulMosques.map(mosque => {
        const distance = calculateDistance(
            referenceLocation.lat, referenceLocation.lng,
            mosque.lat, mosque.lng
        );
        return { ...mosque, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    // Haritaya camileri ekle
    mosquesWithDistance.forEach(mosque => {
        const marker = L.marker([mosque.lat, mosque.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        })
        .addTo(map)
        .bindPopup(`🕌 <strong>${mosque.name}</strong><br>📍 ${mosque.address}<br>📏 ${mosque.distance.toFixed(2)} km uzaklıkta`);
        
        mosqueMarkers.push(marker);
    });
    
    // Liste olarak göster
    displayMosqueList(mosquesWithDistance);
    
    hideLoading();
}

function displayMosqueList(mosques) {
    const mosqueItems = document.getElementById('mosqueItems');
    mosqueItems.innerHTML = '';
    
    mosques.forEach((mosque, index) => {
        const mosqueDiv = document.createElement('div');
        mosqueDiv.className = 'mosque-item';
        mosqueDiv.innerHTML = `
            <div class="mosque-name">🕌 ${mosque.name}</div>
            <div class="mosque-distance">📏 ${mosque.distance.toFixed(2)} km uzaklıkta</div>
            <div class="mosque-address">📍 ${mosque.address}</div>
        `;
        
        // Tıklandığında haritada göster
        mosqueDiv.addEventListener('click', () => {
            map.setView([mosque.lat, mosque.lng], 17);
            mosqueMarkers[index].openPopup();
        });
        
        mosqueItems.appendChild(mosqueDiv);
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}
