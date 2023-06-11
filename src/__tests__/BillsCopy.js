/**
 * @jest-environment jsdom
 */ 
 import { screen, waitFor } from "@testing-library/dom"
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import containerBills from "../containers/Bills.js"
 import mockedBills from "../__mocks__/store.js"
 import router from "../app/Router.js";

 jest.mock("../app/store", () => mockedBills)

describe("When an error occurs on API", () => {
   
    test("fetches messages from an API and fails with 500 message error", async () => {

        mockedBills.bills = () => {
            return {
                list: () => {
                    return Promise.reject(new Error("Erreur 404"))
                }
            }
        }

        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        await router()

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);

        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
    })
  
    test("fetches messages from an API and fails with 500 message error", async () => {

        mockedBills.bills = () => {
            return {
                list: () => {
                    return Promise.reject(new Error("Erreur 500"))
                }
            }
        }

        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        await router()

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);

        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
    })
})