import { http, HttpResponse, passthrough, ws } from "msw";
import { setupWorker } from "msw/browser";

const mockData = [
	{ id: 1, votes: 1, title: "Cocktail Sauce", img: "cocktail-sauce.png" },
	{ id: 2, votes: 5, title: "Roasted Potatoes", img: "roasted-potatoes.png" },
];

const wsLink = ws.link("ws://localhost:8080");

export const worker = setupWorker(
	// REST API mocking
	http.get("/api/v1/data", () => HttpResponse.json(mockData)),
	// passthrough
	http.get("*.png", () => {
		return passthrough();
	}),
	// WS mocking
	wsLink.on("connection", ({ client }) => {
		client.addEventListener("message", (event) => {
			console.log("🚀 ~ client.addEventListener ~ event:", event);
			const data = JSON.parse(event.data);
			switch (data.action) {
				case "INCREMENT": {
					const mockedResponse = {
						id: data.id,
						votesInc: 1,
					};
					if (data.id === 1) {
						mockedResponse.votesInc = 5;
					}
					client.send(JSON.stringify(mockedResponse));
					break;
				}
				default:
					client.send(JSON.stringify(data));
					break;
			}
		});
	}),
);
