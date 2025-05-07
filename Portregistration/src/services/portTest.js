

// export const portApiUrl = `http://3.34.40.154:8080/api/ports`;

// // Create (POST)
// export const storePort = (data) => {
//   return fetch(portApiUrl, {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: {
//       "Content-Type": "application/json",
     
//     },
//   });
// };
// // Delete (DELETE)
// export const destroyPort = (id) => {
//   return fetch(`${portApiUrl}/${id}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
     
//     },
//   });
// };
// // Update (PUT)
// export const updatePort = (data) => {
//   return fetch(`${portApiUrl}/${data.id}`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//     headers: {
//       "Content-Type": "application/json",
     
//     },
//   });
// };
// // Read (GET)
// export const fetchPort = (url) =>
//     fetch(url).then((res) => {
//       if (!res.ok) throw new Error("Failed to fetch port data");
//       return res.json();
//     });
