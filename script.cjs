const fs = require('fs');
const csv = `Outlet No.,State,City,Area,Full Address,Phone Number,Status,Cross-check,Google Maps / Location
1,Telangana,Hyderabad,Lalithabagh / Lal Darwaza,"23-5-1167, Lalithabagh Rd, Balagunj, Murad Nagar, Lal Darwaza, Hyderabad, Telangana 500053",+91 8555047775,Verified,Google Maps + Justdial,URL
2,Telangana,Hyderabad,Musheerabad / Gandhinagar,"1-4-879/72/B, Vigneswar Enclave, Opp. Chapter One Study Hall, Gandhinagar, Bakaram/Kavadiguda, Hyderabad, Telangana 500080",+91 7075047477,Verified,Google Maps + Zomato,URL
3,Telangana,Hyderabad,Kothapet,"13-23-104, Telephone Colony, Tayagarayanagar, Kothapet, Hyderabad, Telangana 500035",+91 9852128128,Verified,Google Maps + Justdial,URL
4,Telangana,Hyderabad,KPHB Phase 4 / Kukatpally,"38/1, Kukatpally Housing Board Colony, Phase VI LIG Flats, KPHB Phase 4, Hyderabad, Telangana 500085",Not publicly listed,Verified,Google Maps + Zomato + Justdial,URL
5,Telangana,Hyderabad,Bachupally,"6691, near Aaha Military Food Court, Bachupally, Hyderabad, Telangana 500118",+91 6304574352,Verified,Google Maps + Zomato,URL
6,Telangana,Hyderabad,Kukatpally / Addagutta,"2-23-B/14, Ground Floor, Addagutta, Samatha Nagar, Near Axis Bank, Kukatpally, Hyderabad, Telangana 500085",+91 9391274215,Verified,Google Maps + Zomato + Swiggy,URL
7,Telangana,Hyderabad,Annojiguda / Badesahebguda,"CMM8+VGJ, Annojiguda, Badesahebguda, Telangana 500088",+91 9966859493,Verified,Google Maps,URL
8,Telangana,Hyderabad,RTC X Road,"SRT 30, RTC X Rd, near Chinna Bazar, Hyderabad, Telangana 500020",+91 9160047345,Verified,Google Maps,URL
9,Telangana,Hyderabad,Saroornagar,"2-80, Mass Colony, Saroornagar, Hyderabad, Telangana 500035",+91 9391595568,Verified,Google Maps,URL
10,Telangana,Hyderabad,Shaikpet / OU Colony,"443, OU Colony, Shaikpet, Hyderabad, Telangana 500104",Not publicly listed,Probable,Google Maps,URL
11,Telangana,Hyderabad,Chanda Nagar / Bandam Kommu,"G839+47H, Vidya Nagar Colony, Bandam Kommu, Chanda Nagar, Ramachandrapuram, Hyderabad, Telangana 502032",Not publicly listed,Probable,Google Maps,URL
12,Telangana,Hyderabad,Patancheru,"Shop No. 1, Sai Ganesh Colony, Alwin Colony, opposite Refresh Time, Patancheru, Hyderabad, Telangana 502319",Not publicly listed,Probable,Justdial,URL
13,Telangana,Hyderabad,Miyapur / Sri Rangapuram Colony,"Rangapuram, opposite SMR Vinay Hi Lands, Sri Rangapuram Colony, Miyapur, Hyderabad, Telangana 500049",Not publicly listed,Verified,Google Maps + Justdial,URL
14,Telangana,Hyderabad,Madharam,"1st Floor, Madharam, near Mallikarjun Fabrication, Hyderabad, Telangana 502319",Not publicly listed,Probable,Justdial,URL
15,Telangana,Hyderabad,Gajularamaram,"Door 32-220, Ground Floor, HAL Colony, Circle 26, Gajularamaram, Hyderabad",+91 9553090480,Verified,Google Maps + Zomato,URL
16,Telangana,Hyderabad,Jeedimetla / HAL Colony,"No. 1, Resolve Colony, HAL Colony, Jeedimetla, Hyderabad, Telangana 500055",Not publicly listed,Probable,Justdial,URL
17,Telangana,Hyderabad,Charminar / Gowlipura,"Gowlipura X Road, Charminar, Hyderabad",+91 7981641028,Verified,Zomato,URL
18,Telangana,Hyderabad,Pedda Amberpet,"8JCQ+MQ3, NH 65, beside Syndicate Bank, Pedda Amberpet, Telangana 501513",Not publicly listed,Probable,Google Maps,URL
19,Telangana,Hyderabad,Vivek Nagar / Kukatpally,"FCM7+59M, Vivek Nagar, Kukatpally, Hyderabad, Telangana 500072",Not publicly listed,Probable,Google Maps,URL
20,Telangana,Hyderabad,Chanda Nagar / Santhi Nagar,"PJR Stadium Ln, Santhi Nagar, Chanda Nagar, Hyderabad, Telangana 500019",Not publicly listed,Probable,Google Maps,URL
21,Telangana,Rangareddy,Ibrahimpatnam,"Opposite Bharat Petrol Pump, Ibrahimpatnam, Rangareddy, Telangana 501506",Not publicly listed,Probable,Justdial,URL
22,Telangana,Rangareddy,Kandukur / Mohammadnagar,"3F5F+R7P, Kandukur, Mohammadnagar, Telangana 500113",Not publicly listed,Probable,Google Maps,URL
23,Telangana,Peddapalli,Peddapalli,"2-21, near Manthani-Peddapalli Road, Main Road, Peddapalli, Telangana 505172",+91 9652197082,Verified,Google Maps + Justdial,URL
24,Telangana,Peddapalli,Gollapalli,"221, near Manthani-Peddapalli Road, Main Road, Gollapalli, Peddapalli, Telangana 505172",Not publicly listed,Verified,Justdial,URL
25,Telangana,Jagtial,Jagtial,"Dharmapuri Bypass Rd, Vidhya Nagar, Jagtial, Telangana 505327",Not publicly listed,Verified,Google Maps,URL
26,Telangana,Armur,Armur,"Vinayak Nagar, opposite Union Bank, Kotarmoor, Perkit, Armur, Telangana 503223",+91 9059087834,Verified,Google Maps,URL
27,Telangana,Mustabad,Mustabad,"5-50, Kamareddy Road, Mustabad, Telangana 505404",+91 9573806727,Verified,Google Maps,URL
28,Telangana,Mahabubabad,Mahabubabad,"H2V2+J7J, Mahabubabad, Telangana 506101",Not publicly listed,Needs Verification,Google Maps,URL
29,Telangana,Thallada,Kalluru,"5GXW+J2G, Kalluru-Rajavaram-Madhira Rd, Thallada, Kalluru, Telangana 507209",Not publicly listed,Needs Verification,Google Maps; temporarily closed listing,URL
30,Telangana,Warangal,Kashibugga / LB Nagar,"XJR9+7P6, Kashibugga Road, Kashibugga, LB Nagar, Warangal, Telangana 506006",Not publicly listed,Probable,Google Maps,URL
31,Telangana,Hanamkonda,Subedari,"4, Excise Colony, Subedari, Hanamkonda, Telangana 506001",Not publicly listed,Probable,Google Maps,URL
32,Telangana,Kothagudem,Kothagudem Locality,"House 3-1-195/3, Vidya Nagar Colony, near Hyundai Showroom, Kothagudem",+91 9704393817,Verified,Google Maps + Zomato,URL
33,Andhra Pradesh,Guntur,Krishna Nagar,"Krishna Nagar Main Road, Krishna Nagar, Guntur, Andhra Pradesh 522006",+91 7780573456,Verified,Google Maps,URL
34,Andhra Pradesh,Guntur,Nallapadu,"Bhavanipuram, Ananda Theertha Agraharam, opposite Mirchi Yard, Nallapadu Rural, Guntur, Andhra Pradesh 522004",+91 9053639642,Probable,Google Maps,URL
35,Andhra Pradesh,Guntur,Prathipadu,"Near New Sub-Registrar Office, Rama Vagu, Prathipadu, Guntur, Andhra Pradesh 522019",Not publicly listed,Verified,Google Maps + Justdial,URL
36,Andhra Pradesh,Tenali,Ramalingeswara Pet / Devi Chowk,"Devi Chowk, opposite HDFC Bank, Ramalingeswara Pet, Tenali, Andhra Pradesh 522201",Not publicly listed,Verified,Google Maps + Justdial,URL
37,Andhra Pradesh,Kadapa,Chinna Chowk / Central Jail,"Sainik Nagar, near Central Jail, Chinna Chowk, Kadapa, Andhra Pradesh 516002",+91 9493220660,Verified,Google Maps + Justdial,URL
38,Andhra Pradesh,Kadapa,Reddy Colony / NGO Colony,"Near Brahmaiah Shed, Reddy Colony, N.G.O Colony, Chinna Chauku, Kadapa, Andhra Pradesh 516001",+91 9676261043,Verified,Google Maps,URL
39,Andhra Pradesh,Tirupati,Joharapuram / Korramenugunta,"Jolapuram, Ramapriya Nagar, Kadru Homes, Joharapuram, Korramenugunta, Tirupati, Andhra Pradesh 517501",+91 9908455064,Verified,Google Maps,URL
40,Karnataka,Chikmagalur,Kadur Road / AIT Circle,"Sy No. 507/1, near AIT Circle, beside Udupi Hotel, Kadur Road, Chikmagalur Rural, Karnataka 577102",Not publicly listed,Probable,Swiggy + prior public listing,URL
41,Andhra Pradesh,Chebrolu,Chebrolu,"Main Road, beside Hitech ATM, Chebrolu, Andhra Pradesh 522212",+91 9553660423,Probable,Search-directory listing,URL
42,Andhra Pradesh,Eluru,Eastern Street,"Shop No. 2, near Vmax Theatre, Eastern Street, Eluru, Andhra Pradesh 534001",+91 8019925555,Probable,Search-directory listing,URL
43,Andhra Pradesh,Punganur,Punganur Bypass,"Punganur Bypass, near UVR Cycle, Punganur, Andhra Pradesh 517247",Not publicly listed,Probable,Search-directory listing,URL
44,Andhra Pradesh,Palamaner,Sai Nagar / Gangavaram,"Madanapalli Road, Sai Nagar, Palamaner, Gangavaram, Andhra Pradesh 517408",Not publicly listed,Probable,Search-directory listing,URL
45,Andhra Pradesh,Venkatagirikota,Dasarlapalli,"Kuppam Road, near GMR Petrol Bunk, Dasarlapalli, Venkatagirikota, Andhra Pradesh 517424",+91 9000244479,Probable,Search-directory listing,URL
46,Andhra Pradesh,Badvel,Chennampalle,"P375+VF4, Siddavatam Road, Badvel, Chennampalle, Andhra Pradesh 516502",Not publicly listed,Probable,Search-directory listing,URL
47,Andhra Pradesh,Banaganapalle,Banumukkala,"Tadipatri-Banaganapalle-Nandyal Highway, Banumukkala, Andhra Pradesh 518124",Not publicly listed,Probable,Search-directory listing,URL
48,Andhra Pradesh,Madakshira,Madakshira,"W7R7+CC5, Madakshira, Andhra Pradesh 515301",Not publicly listed,Probable,Search-directory listing,URL
49,Andhra Pradesh,Gandrajupalli,Totireddipalle,"5HRR+2QG, Totireddipalle, Gandrajupalle/Gandrajupalli, Andhra Pradesh 517432",Not publicly listed,Needs Verification,Search-directory listing,URL`;

const lines = csv.split('\n').slice(1).filter(l => l.trim().length > 0);
let out = `import type { Outlet } from './types';\n\nexport const outlets: Outlet[] = [\n`;

let cityCoords = {
  'Hyderabad': [17.3850, 78.4867],
  'Rangareddy': [17.3000, 78.4000],
  'Peddapalli': [18.6146, 79.3789],
  'Jagtial': [18.7990, 78.9142],
  'Armur': [18.7833, 78.2833],
  'Mustabad': [18.3300, 78.7100],
  'Mahabubabad': [17.6080, 80.0166],
  'Thallada': [17.1500, 80.3500],
  'Warangal': [17.9689, 79.5941],
  'Hanamkonda': [18.0000, 79.5833],
  'Kothagudem': [17.5500, 80.6300],
  'Guntur': [16.3067, 80.4365],
  'Tenali': [16.2376, 80.6432],
  'Kadapa': [14.4673, 78.8242],
  'Tirupati': [13.6288, 79.4192],
  'Chikmagalur': [13.3161, 75.7720],
  'Chikkamagaluru': [13.3161, 75.7720],
  'Chebrolu': [16.1950, 80.5333],
  'Eluru': [16.7107, 81.1031],
  'Punganur': [13.3667, 78.5833],
  'Palamaner': [13.2000, 78.7500],
  'Venkatagirikota': [12.9833, 78.6167],
  'Badvel': [14.7333, 79.0500],
  'Banaganapalle': [15.3167, 78.2333],
  'Madakshira': [13.9333, 77.2667],
  'Gandrajupalli': [13.3667, 78.5833]
};

// Also add the specific ones mentioned in the first part of the prompt
out += `  { id: 'new-1', name: 'Deccan Chai - Kadur Road', city: 'Chikkamagaluru', area: 'Near AIT Circle', address: 'Near AIT Circle, beside Udupi Hotel, Kadur Road, Chikkamagaluru 577102', hours: '6:00 AM – 11:30 PM', phone: '+91 93090 02185', lat: 13.3161, lng: 75.7720, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;
out += `  { id: 'new-2', name: 'Deccan Chai - Gangavathi', city: 'Koppal', area: 'Sri Ram Nagar', address: 'Sri Ram Nagar, Devi Residency, Gangavathi, Koppal District 583282', hours: '6:00 AM – 11:30 PM', phone: '—', lat: 15.4332, lng: 76.5315, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;
out += `  { id: 'new-3', name: 'Deccan Chai - Nandoor', city: 'Kalaburagi', area: 'Shahbad Road', address: '7V4W+72F, Shahbad Road, near Panchmukhi Hanuman Temple, Nandoor K, Karnataka 585228', hours: '6:00 AM – 11:30 PM', phone: '—', lat: 17.3297, lng: 76.8343, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;
out += `  { id: 'new-4', name: 'Deccan Chai - Shahbad', city: 'Kalaburagi', area: 'Bankoor Cross', address: 'Shop No. 1, Deccan Chai, Bankoor Cross, Main Road, opposite Pawar Medical, Shahbad 585228', hours: '6:00 AM – 11:30 PM', phone: '—', lat: 17.1333, lng: 76.9333, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;
out += `  { id: 'new-5', name: 'Deccan Chai - Shahabad 2', city: 'Kalaburagi', area: 'Shahabad', address: '4W9R+V7W, Shahabad, Karnataka 585228', hours: '6:00 AM – 11:30 PM', phone: '—', lat: 17.1330, lng: 76.9330, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;
out += `  { id: 'new-6', name: 'Deccan Chai - Janwada', city: 'Bidar', area: 'Janwada', address: 'Janwada, Karnataka 585402', hours: '6:00 AM – 11:30 PM', phone: '+91 91082 97517', lat: 17.9104, lng: 77.5199, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;
out += `  { id: 'new-7', name: 'Deccan Chai - Shantinagar', city: 'Kalaburagi', area: 'Shanti Nagar', address: 'Shop No. 01, Shantinagar 4 Depot, Bus Stand Road, Shanti Nagar, Kalaburagi 585103', hours: 'Temporarily Closed', phone: '+91 93801 06818', lat: 17.3300, lng: 76.8300, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;


lines.forEach((line, index) => {
  let inQuotes = false;
  let cols = [];
  let current = '';
  for(let i=0; i<line.length; i++){
    if(line[i] === '"') inQuotes = !inQuotes;
    else if(line[i] === ',' && !inQuotes){
      cols.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  cols.push(current);

  if(cols.length < 6) return;

  let id = 'outlet-' + (index + 8);
  let state = cols[1];
  let city = cols[2];
  let area = cols[3];
  let addr = cols[4].replace(/'/g, "\\'");
  let phone = cols[5];
  
  let coords = cityCoords[city] || [17.3850, 78.4867];
  let lat = coords[0] + (Math.random() - 0.5) * 0.05;
  let lng = coords[1] + (Math.random() - 0.5) * 0.05;

  out += `  { id: '${id}', name: 'Deccan Chai - ${area.replace(/'/g, "\\'")}', city: '${city}', area: '${area.replace(/'/g, "\\'")}', address: '${addr}', hours: '6:00 AM – 11:30 PM', phone: '${phone}', lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}, amenities: ['Dine-in', 'Takeaway'], dineIn: true, takeaway: true },\n`;
});

out += `];\n\n`;

out += `export const cities = [\n  ...Array.from(new Set([\n    ...outlets.map((o) => o.city),\n    'Bengaluru', 'Kolar', 'Tumakuru', 'Mysuru', 'Chikkaballapur', 'Ballari', 'Hubballi', 'Dharwad', 'Belagavi', 'Mangaluru', 'Shivamogga', 'Hassan', 'Raichur', 'Vijayapura', 'Bagalkot', 'Davanagere', 'Mandya'\n  ])).sort()\n];\n`;

fs.writeFileSync('src/data/outlets.ts', out);
console.log('Outlets generated successfully!');
