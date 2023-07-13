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
import BILLS from "../containers/Bills"

jest.mock("../app/store", () => mockedBills)

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

describe("Given I am connected as an employee", () => {

  it("Should handle click on NewBill", () => {

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

  it("Should handle click on eye-icon", () => {
    jQuery.fn.modal = () => { }

    const ArrayOfIconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    expect(ArrayOfIconEye).toBeDefined()

    const BillsContainer = new containerBills({
      document, onNavigate, store: mockedBills, localStorage
    })
    BillsContainer.handleClickIconEye = jest.fn()

    // On simule un clic sur le premier icone Oeil
    ArrayOfIconEye[0].click()

    // on s'attend à ce que la méthode affichant la modale soit appellée
    expect(BillsContainer.handleClickIconEye).toHaveBeenCalled();

  })

  it("Should get Bills correctly", async () => {

    const billToCompare = [{
      "id": "47qAXb6fIm2zOKkLzMro",
      "vat": "80",
      "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      "status": "En attente",
      "type": "Hôtel et logement",
      "commentary": "séminaire billed",
      "name": "encore",
      "fileName": "preview-facture-free-201801-pdf-1.jpg",
      "date": "4 Avr. 04",
      "amount": 400,
      "commentAdmin": "ok",
      "email": "a@a",
      "pct": 20
    },
    {
      "id": "BeKy5Mo4jkmdfPGYpTxZ",
      "vat": "",
      "amount": 100,
      "name": "test1",
      "fileName": "1592770761.jpeg",
      "commentary": "plop",
      "pct": 20,
      "type": "Transports",
      "email": "a@a",
      "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
      "date": "1 Jan. 01",
      "status": "Refused",
      "commentAdmin": "en fait non"
    },
    {
      "id": "UIUZtnPQvnbFnB0ozvJh",
      "name": "test3",
      "email": "a@a",
      "type": "Services en ligne",
      "vat": "60",
      "pct": 20,
      "commentAdmin": "bon bah d'accord",
      "amount": 300,
      "status": "Accepté",
      "date": "3 Mar. 03",
      "commentary": "",
      "fileName": "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
      "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3"
    },
    {
      "id": "qcCK3SzECmaZAGRrHjaC",
      "status": "Refused",
      "pct": 20,
      "amount": 200,
      "email": "a@a",
      "name": "test2",
      "vat": "40",
      "fileName": "preview-facture-free-201801-pdf-1.jpg",
      "date": "2 Fév. 02",
      "commentAdmin": "pas la bonne facture",
      "commentary": "test2",
      "type": "Restaurants et bars",
      "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
    }
    ]


    let myCBills = new containerBills({ document, onNavigate, store: mockedBills, localStorage });
    
    // on utilise la méthode permettant de récupérer les Bills
    const formatedBills = await myCBills.getBills()
  
    // on compare les deux listes de Bills
    expect(formatedBills).toStrictEqual(billToCompare)
  })

})

describe("Integration test when I am connected as an employee", () => {

  describe("When I navigate to Bills", () => {
    it("Should display all mocked bills from API GET ", async () => {

      document.body.innerHTML=''
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      const root = document.createElement('div')
      root.setAttribute('id','root')

      document.body.appendChild(root)

      router()

      window.onNavigate(ROUTES_PATH.Bills)

      // quand on navige sur la page des factures, elles doivent toutes être affichés
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
      const allIconEye = screen.getAllByTestId("icon-eye")
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy()
      expect(allIconEye.length).toBe(4)
    })
  })

  describe("When an error occurs on API", () => {
    
    test("fetches messages from an API and fails with 404 message error", async () => {

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
})
