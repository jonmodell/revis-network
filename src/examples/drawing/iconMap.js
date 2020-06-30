const img1 = new Image();
img1.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJhZ2VudCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxMXB4IiBoZWlnaHQ9IjExcHgiIHZpZXdCb3g9IjAgMCAxMSAxMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTEgMTE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiM5OTk5OTk7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQ0KCS5zdDF7ZmlsbDojOTk5OTk5O30NCjwvc3R5bGU+DQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOSwxMC41SDJjLTAuMywwLTAuNS0wLjItMC41LTAuNVYxYzAtMC4zLDAuMi0wLjUsMC41LTAuNWg3YzAuMywwLDAuNSwwLjIsMC41LDAuNXY5QzkuNSwxMC4zLDkuMywxMC41LDksMTAuNQ0KCXoiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9IjMuNSwwLjUgMy41LDcgNC41LDguNSA0LjUsMTAuNSAiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9IjcuNSwwLjUgNy41LDcgNi41LDguNSA2LjUsMTAuNSAiLz4NCjxyZWN0IHg9IjUiIHk9IjIiIGNsYXNzPSJzdDEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4NCjxyZWN0IHg9IjUiIHk9IjQiIGNsYXNzPSJzdDEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4NCjxyZWN0IHg9IjUiIHk9IjYiIGNsYXNzPSJzdDEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4NCjwvc3ZnPg==';

const img2 = new Image();
img2.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJwcm9jZXNzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjExcHgiIGhlaWdodD0iMTFweCIgdmlld0JveD0iMCAwIDExIDExIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMSAxMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6bm9uZTtzdHJva2U6Izk5OTk5OTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPGc+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTEwLjUsOWMwLDAuMy0wLjIsMC41LTAuNSwwLjVIMUMwLjcsOS41LDAuNSw5LjMsMC41LDlsMC03YzAtMC4zLDAuMi0wLjUsMC41LTAuNWg5YzAuMywwLDAuNSwwLjIsMC41LDAuNVY5eg0KCQkiLz4NCjwvZz4NCjxsaW5lIGNsYXNzPSJzdDAiIHgxPSIwLjUiIHkxPSIzLjUiIHgyPSIxMC41IiB5Mj0iMy41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iMi41IiB5MT0iNS41IiB4Mj0iMy41IiB5Mj0iNS41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iNS41IiB5MT0iNS41IiB4Mj0iOC41IiB5Mj0iNS41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iMi41IiB5MT0iNy41IiB4Mj0iNC41IiB5Mj0iNy41Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iNi41IiB5MT0iNy41IiB4Mj0iNy41IiB5Mj0iNy41Ii8+DQo8L3N2Zz4=';

const img3 = new Image();
img3.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJ0b3BvbG9neSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxMXB4IiBoZWlnaHQ9IjExcHgiIHZpZXdCb3g9IjAgMCAxMSAxMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTEgMTE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiM5OTk5OTk7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQ0KPC9zdHlsZT4NCjxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjUuNSIgY3k9IjUuNSIgcj0iMS45Ii8+DQo8Zz4NCgk8Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSI1LjUiIGN5PSIxLjQiIHI9IjAuOSIvPg0KCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjUuNSIgY3k9IjkuNiIgcj0iMC45Ii8+DQoJPGxpbmUgY2xhc3M9InN0MCIgeDE9IjUuNSIgeTE9IjIuMyIgeDI9IjUuNSIgeTI9IjMuNiIvPg0KCTxsaW5lIGNsYXNzPSJzdDAiIHgxPSI1LjUiIHkxPSI3LjQiIHgyPSI1LjUiIHkyPSI4LjciLz4NCjwvZz4NCjxnPg0KCTxlbGxpcHNlIHRyYW5zZm9ybT0ibWF0cml4KDAuNSAtMC44NjYgMC44NjYgMC41IC0yLjAxMzEgMy40NTA2KSIgY2xhc3M9InN0MCIgY3g9IjIiIGN5PSIzLjUiIHJ4PSIwLjkiIHJ5PSIwLjkiLz4NCgk8ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCgwLjUgLTAuODY2IDAuODY2IDAuNSAtMi4wMTMxIDExLjU3NTYpIiBjbGFzcz0ic3QwIiBjeD0iOSIgY3k9IjcuNSIgcng9IjAuOSIgcnk9IjAuOSIvPg0KCTxsaW5lIGNsYXNzPSJzdDAiIHgxPSIyLjciIHkxPSIzLjkiIHgyPSIzLjkiIHkyPSI0LjYiLz4NCgk8bGluZSBjbGFzcz0ic3QwIiB4MT0iNy4xIiB5MT0iNi40IiB4Mj0iOC4zIiB5Mj0iNy4xIi8+DQo8L2c+DQo8Zz4NCgk8ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCgwLjg2NiAtMC41IDAuNSAwLjg2NiAtMy41MDAxIDEuOTk5OSkiIGNsYXNzPSJzdDAiIGN4PSIyIiBjeT0iNy41IiByeD0iMC45IiByeT0iMC45Ii8+DQoJPGVsbGlwc2UgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYgLTAuNSAwLjUgMC44NjYgLTAuNTI2MiA0Ljk3MzgpIiBjbGFzcz0ic3QwIiBjeD0iOSIgY3k9IjMuNSIgcng9IjAuOSIgcnk9IjAuOSIvPg0KCTxsaW5lIGNsYXNzPSJzdDAiIHgxPSIyLjciIHkxPSI3LjEiIHgyPSIzLjkiIHkyPSI2LjQiLz4NCgk8bGluZSBjbGFzcz0ic3QwIiB4MT0iNy4xIiB5MT0iNC42IiB4Mj0iOC4zIiB5Mj0iMy45Ii8+DQo8L2c+DQo8L3N2Zz4=';

const img4 = new Image();
img4.src =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIGlkPSJhZ2VudCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxMXB4IiBoZWlnaHQ9IjExcHgiIHZpZXdCb3g9IjAgMCAxMSAxMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTEgMTE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiM5OTk5OTk7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQ0KCS5zdDF7ZmlsbDpub25lO3N0cm9rZTojOTk5OTk5O3N0cm9rZS1taXRlcmxpbWl0OjEwO30NCjwvc3R5bGU+DQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOS4zLDJDOC4zLDEuMSw3LDAuNSw1LjUsMC41QzQsMC41LDIuNywxLjEsMS43LDIiLz4NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik03LjMsM0M2LjgsMi43LDYuMiwyLjUsNS41LDIuNUM0LjgsMi41LDQuMiwyLjcsMy43LDMiLz4NCjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik04LjUsNy41YzAtMS43LTEuNC0zLjEtMy4yLTNDMy43LDQuNiwyLjUsNiwyLjUsNy43bDAsMi4zYzAsMC4zLDAuMiwwLjUsMC41LDAuNWg1YzAuMywwLDAuNS0wLjIsMC41LTAuNVY3LjV6DQoJIi8+DQo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMi41LDkuNUgxQzAuNyw5LjUsMC41LDkuMywwLjUsOVY4YzAsMCwwLTEuNSwyLTEuNSIvPg0KPHBhdGggY2xhc3M9InN0MSIgZD0iTTguNSw5LjVIMTBjMC4zLDAsMC41LTAuMiwwLjUtMC41VjhjMCwwLDAtMS41LTItMS41Ii8+DQo8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSI1LjUiIGN5PSI3LjUiIHI9IjEiLz4NCjwvc3ZnPg==';

export default {
  device: { element: img1, offsetY: -2 },
  appComp: { element: img2, scale: 0.8, offsetY: 2 },
  topoElement: { element: img3, scale: 0.8, offsetY: 1 },
  harProvider: { element: img4, scale: 0.9, offsetY: -2 },
};