/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import containerBills from "../containers/Bills.js"
import  mockedBills  from "../__mocks__/store.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.getAttribute("class")).toContain("active-icon")

    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })



  })
})

describe("Given I am connected as an employee", ()=>{
  it("Should handle click on NewBill", ()=>{

    const onNavigate = jest.fn()

    const containerOfBills = new containerBills({
      document, onNavigate, store: mockedBills, localStorage: window.localStorage
    })
    containerOfBills.handleClickNewBill = jest.fn()
  

    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    expect(buttonNewBill).toBeDefined()

    buttonNewBill.click()

    // On attend à ce que lorsque l'on clic sur le bouton "NewBill", on soit redirigé...
    // ... vers la page NewBill.
    expect(containerOfBills.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])

  })

  it("Should handle click on eye-icon", ()=>{
    jQuery.fn.modal = () => {}

    const ArrayOfIconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    expect(ArrayOfIconEye).toBeDefined()

    const BillsContainer = new containerBills({
      document, onNavigate, store: mockedBills, localStorage
    })
    BillsContainer.handleClickIconEye = jest.fn()

    ArrayOfIconEye[0].click()

    expect(BillsContainer.handleClickIconEye).toHaveBeenCalled();

  })

  it("Should display Bills ", async ()=>{
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    
   
    const store = {
      bills: ( )=>{
        return {
          list: ()=>{
            return new Promise(()=>bills)
          }
        };
      }
    }
    let myCBills = new containerBills({ document, onNavigate,store, localStorage });
    
    const formattedBills = await myCBills.getBills()

    console.log(formattedBills)
    console.log("/+++++++++/")


  })

})

describe("Integration test when I am connected as an employee", () => {

  describe("When I navigate to Bills", ()=>{
    it("Should display Bills", async ()=>{
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Dashboard)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const billsOne = await screen.getByText("test1")
      expect(billsOne).toBeTruthy()
      const billsTwo = await screen.getByText("test2")
      expect(billsTwo).toBeTruthy()
      const billsThree = await screen.getByText("test3")
      expect(billsThree).toBeTruthy()
      const billsFour = await screen.getByText("encore")
      expect(billsFour).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy()
    })
  })

  describe("When an error occurs on API", () => {

    beforeEach(() => {
      jest.clearAllMocks()
      jest.spyOn(mockedBills, "bills")
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
      router()
    })

    test.skip("fetches bills from an API and fails with 404 message error", async () => {
      mockedBills.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test.skip("fetches messages from an API and fails with 500 message error", async () => {

      mockedBills.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
