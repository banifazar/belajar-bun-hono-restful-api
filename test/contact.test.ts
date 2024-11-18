import {afterEach, beforeEach, describe, expect, it} from "bun:test";
import {ContactTest, UserTest} from "./test-util";
import app from "../src";
import {logger} from "../src/application/logging";

describe("POST /api/contacts", () => {

    beforeEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.create();
    });

    afterEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.delete();
    });

    it("should rejected if token is invalid", async () => {
        const response = await app.request("/api/contacts", {
            method: "POST",
            headers: {
                "Authorization": "salah"
            },
            body: JSON.stringify({
                first_name: ""
            })
        });

        expect(response.status).toBe(401);

        const body = await response.json();
        expect(body.errors).toBeDefined();
    });

    it("should rejected if contact is invalid", async () => {
        const response = await app.request("/api/contacts", {
            method: "POST",
            headers: {
                "Authorization": "test"
            },
            body: JSON.stringify({
                first_name: ""
            })
        });

        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body.errors).toBeDefined();
    });

    it("should success if contact is valid (only first_name)", async () => {
        const response = await app.request("/api/contacts", {
            method: "POST",
            headers: {
                "Authorization": "test"
            },
            body: JSON.stringify({
                first_name: "bani"
            })
        });

        expect(response.status).toBe(200);
        logger.debug(response.body);

        const body = await response.json();
        expect(body.data).toBeDefined();
        expect(body.data.first_name).toBeDefined();
        expect(body.data.last_name).toBeNull();
        expect(body.data.email).toBeNull();
        expect(body.data.phone).toBeNull();

    });

    it("should success if contact is valid (full data)", async () => {
        const response = await app.request("/api/contacts", {
            method: "POST",
            headers: {
                "Authorization": "test"
            },
            body: JSON.stringify({
                first_name: "bani",
                last_name: "faza",
                email: "bfr@example.com",
                phone: "1231311231"

            })
        });

        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toBeDefined();
        expect(body.data.first_name).toBe("bani");
        expect(body.data.last_name).toBe("faza");
        expect(body.data.email).toBe("bfr@example.com");
        expect(body.data.phone).toBe("1231311231");

    });
});

describe("GET /api/contacts/:id", () => {

    beforeEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.create();
        await ContactTest.create();
    });

    afterEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.delete();
    });

    it("should get 404 if contact is not found", async () => {
        const contact = await ContactTest.get();

        const response = await app.request("/api/contacts/" + (contact.id + 1), {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body.errors).toBeDefined();


    });

    it("should success if contact is exists", async () => {
        const contact = await ContactTest.get();

        const response = await app.request("/api/contacts/" + contact.id, {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(contact.id);
        expect(body.data.first_name).toBe(contact.first_name);
        expect(body.data.last_name).toBe(contact.last_name);
        expect(body.data.email).toBe(contact.email);
        expect(body.data.phone).toBe(contact.phone);
    });
});

describe("PUT /api/contacts/:id", () => {

    beforeEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.create();
        await ContactTest.create();
    });

    afterEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.delete();
    });

    it("should rejected update contact if request is invalid", async () => {
        const contact = await ContactTest.get();

        const response = await app.request("/api/contacts/" + contact.id, {
            method: "PUT",
            headers: {
                "Authorization": "test"
            },
            body: JSON.stringify({
                first_name: ""
            })
        });

        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body.errors).toBeDefined();
    });

    it("should rejected update contact if id is not found", async () => {
        const contact = await ContactTest.get();

        const response = await app.request("/api/contacts/" + (contact.id + 1), {
            method: "PUT",
            headers: {
                "Authorization": "test"
            },
            body: JSON.stringify({
                first_name: "Bani"
            })
        });

        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body.errors).toBeDefined();
    });

    it("should success update contact if request is valid", async () => {
        const contact = await ContactTest.get();

        const response = await app.request("/api/contacts/" + contact.id, {
            method: "PUT",
            headers: {
                "Authorization": "test"
            },
            body: JSON.stringify({
                first_name: "bani",
                last_name: "faza",
                email: "bfr@example.com",
                phone: "1231234"
            })

        });

        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toBeDefined();
        expect(body.data.first_name).toBe("bani");
        expect(body.data.last_name).toBe("faza");
        expect(body.data.email).toBe("bfr@example.com");
        expect(body.data.phone).toBe("1231234");

    });
});

describe("DELETE /api/contacts/id", () => {

    beforeEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.create();
        await ContactTest.create();
    });

    afterEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.delete();
    });

    it("should rejected if contact id is not found", async () => {
        const contact = await ContactTest.get();

        const response = await app.request("/api/contacts/" + (contact.id + 1), {
            method: "DELETE",
            headers: {
                "Authorization": "test"
            }

        });

        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body.errors).toBeDefined();
    });


    it("should success if contact is exists", async () => {
        const contact = await ContactTest.get();

        const response = await app.request("/api/contacts/" + contact.id, {
            method: "DELETE",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toBe(true);
    });
});

describe("GET /api/contacts", () => {

    beforeEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.create();
        await ContactTest.createMany(25);
    });

    afterEach(async () => {
        await ContactTest.deleteAll();
        await UserTest.delete();
    });

    it("should be able to search contact", async () => {
        const response = await app.request("/api/contacts",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data.length).toBe(10);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(3);

    });

    it("should be able to search contact using name", async () => {
        let response = await app.request("/api/contacts?name=an",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        let body = await response.json();
        expect(body.data.length).toBe(10);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(3);

        response = await app.request("/api/contacts?name=az",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        body = await response.json();
        expect(body.data.length).toBe(10);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(3);
    });

    it("should be able to search contact using email", async () => {
        let response = await app.request("/api/contacts?email=gmail",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        let body = await response.json();
        expect(body.data.length).toBe(10);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(3);


        response = await app.request("/api/contacts?name=gaada",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        body = await response.json();
        expect(body.data.length).toBe(0);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(0);
    });

    it("should be able to search contact using phone", async () => {
        let response = await app.request("/api/contacts?phone=31",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        let body = await response.json();
        expect(body.data.length).toBe(10);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(3);


        response = await app.request("/api/contacts?name=budi",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        body = await response.json();
        expect(body.data.length).toBe(0);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(0);
    });

    it("should be able to search contact without result", async () => {
        let response = await app.request("/api/contacts?name=budi",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        let body = await response.json();
        expect(body.data.length).toBe(0);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(10);
        expect(body.paging.total_page).toBe(0);
    });

    it("should be able to search contact with paging", async () => {
        let response = await app.request("/api/contacts?size=5",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        let body = await response.json();
        expect(body.data.length).toBe(5);
        expect(body.paging.current_page).toBe(1);
        expect(body.paging.size).toBe(5);
        expect(body.paging.total_page).toBe(5);

        response = await app.request("/api/contacts?size=5&page=2",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        body = await response.json();
        expect(body.data.length).toBe(5);
        expect(body.paging.current_page).toBe(2);
        expect(body.paging.size).toBe(5);
        expect(body.paging.total_page).toBe(5);

        response = await app.request("/api/contacts?size=5&page=100",  {
            method: "GET",
            headers: {
                "Authorization": "test"
            }
        });

        expect(response.status).toBe(200);

        body = await response.json();
        expect(body.data.length).toBe(0);
        expect(body.paging.current_page).toBe(100);
        expect(body.paging.size).toBe(5);
        expect(body.paging.total_page).toBe(5);
    });
});

