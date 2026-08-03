export const tamilNaduDistricts = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kancheepuram",
  "Kanniyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thiruvallur",
  "Thiruvarur",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvannamalai",
  "The Nilgiris",
  "Vellore",
  "Villupuram",
  "Virudhunagar",
];

export const districtOptions = [
  { label: "ALL DISTRICTS", value: "" },
  ...tamilNaduDistricts.map((district) => ({
    label: district.toUpperCase(),
    value: district.toUpperCase(),
  })),
];

export const foodTypeOptions = [
  { label: "ALL FOOD TYPES", value: "" },
  { label: "VEG", value: "VEG" },
  { label: "NON-VEG", value: "NON-VEG" },
  { label: "VEG AND NON-VEG", value: "VEG AND NON-VEG" },
  { label: "VEGAN", value: "VEGAN" },
  { label: "JAIN FOOD", value: "JAIN FOOD" },
  { label: "SOUTH INDIAN", value: "SOUTH INDIAN" },
  { label: "NORTH INDIAN", value: "NORTH INDIAN" },
  { label: "CHINESE", value: "CHINESE" },
  { label: "CONTINENTAL", value: "CONTINENTAL" },
  { label: "SNACKS AND SWEETS", value: "SNACKS AND SWEETS" },
  { label: "CUSTOM MENU", value: "CUSTOM MENU" },
];

export const eventTypeOptions = [
  { label: "ALL EVENT TYPES", value: "" },
  { label: "WEDDING", value: "WEDDING" },
  { label: "RECEPTION", value: "RECEPTION" },
  { label: "ENGAGEMENT", value: "ENGAGEMENT" },
  { label: "BIRTHDAY", value: "BIRTHDAY" },
  { label: "EAR PIERCING", value: "EAR PIERCING" },
  { label: "BABY SHOWER", value: "BABY SHOWER" },
  { label: "NAMING CEREMONY", value: "NAMING CEREMONY" },
  { label: "HOUSE WARMING", value: "HOUSE WARMING" },
  { label: "CORPORATE EVENT", value: "CORPORATE EVENT" },
  { label: "COLLEGE EVENT", value: "COLLEGE EVENT" },
  { label: "FAMILY FUNCTION", value: "FAMILY FUNCTION" },
  { label: "TEMPLE FUNCTION", value: "TEMPLE FUNCTION" },
  { label: "CUSTOM EVENT", value: "CUSTOM EVENT" },
];

export const dashboardDistrictOptions = districtOptions.filter(
  (option) => option.value
);

export const dashboardFoodTypeOptions = foodTypeOptions;

export const dashboardEventTypeOptions = eventTypeOptions;
