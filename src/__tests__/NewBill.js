/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { ROUTES_PATH } from '../constants/routes.js'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockedStore from "../__mocks__/store.js"
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

jest.mock("../app/store", () => mockedStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should detect change on file input", async () => {
        const html =  NewBillUI()
        document.body.innerHTML = html
        //to-do write assertion
        
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const onNavigate = jest.fn();
        const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})
        const handleChangeFile1 = jest.fn((e) => newBillClass.handleChangeFile(e))
        const imageInput = screen.getByTestId('file')

        // verifie que les variables soient NULL
        expect(newBillClass.fileUrl).toBeNull()
        expect(newBillClass.fileName).toBeNull()
        expect(newBillClass.billId).toBeNull()
        expect(newBillClass.fileName).toBeFalsy()

        imageInput.addEventListener('change', handleChangeFile1)

        // Simule un choix de fichier ".png" par l'utilisateur dans l'input File.
        const file = new File(["blob"], 'fichier.png', { type: 'image/png' })
        await fireEvent.change(imageInput, {
          target: {
            files: [file]
          }
        })

        // Vérifie que la méthode à bien été appelée
        expect(handleChangeFile1).toHaveBeenCalled()

        // vérifie que les variables aient bien été modifiées
        expect(newBillClass.fileUrl).not.toBeNull()
        expect(newBillClass.fileName).not.toBeNull()

    })
    test("Then it should detect wrong extension file input",  () => {
      const html =  NewBillUI()
      document.body.innerHTML = html

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const onNavigate = jest.fn();
      const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})

      //Après avoir chargé la page on charge un fichier dont l'extension ne correspond pas au format attendu.
      const imageInput = screen.getByTestId('file')
      const file = new File(["blob"], 'fichier.png', { type: 'unknown' })
      fireEvent.change(imageInput, {
        target: {
          files: [file]
        }
      })

      // Onn s'attend à ce que la variable isWrongExtensionFile soit VRAI
      expect(newBillClass.isWrongExtensionFile).toBeTruthy()
    })
    test("Then HandleSubmit should redirect correctly",  () => {
      const html =  NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const form = document.querySelector(`form[data-testid="form-new-bill"]`)
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
    
      const onNavigate = jest.fn();

      const newBillClass = new NewBill({document, onNavigate , store: mockedStore , localStorage})
      const handleSubmitTest = jest.fn((e) => newBillClass.handleSubmit(e))

      form.addEventListener('submit', handleSubmitTest)

      // Effectue une action qui déclenche l'événement de soumission
      form.submit();

      // On vérifie que la méthode handleSubmitTest aie bien été appellée et que la page Bills aie bien été chargée
      expect(handleSubmitTest).toHaveBeenCalled()
      expect(newBillClass.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    
      
    })
   
  })

  describe("Integration test when I am on NewBill Page", ()=>{
    test("It should display all input's form",async () => {
      document.body.innerHTML=''

      // login chargé et navigation vers la page NewBill
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement('div')
      root.setAttribute('id','root')
      document.body.appendChild(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      // attente de l'affichage de la page
      await waitFor(() => screen.getByText("Envoyer une note de frais"))

      // vérification de l'intégralité des champs du formulaire
      expect(screen.getAllByText("Type de dépense")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()

      expect(screen.getAllByText("Nom de la dépense")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()

      expect(screen.getAllByText("Date")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()

      expect(screen.getAllByText("Montant TTC")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()

      expect(screen.getAllByText("TVA")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()

      expect(screen.getAllByText("%")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()

      expect(screen.getAllByText("Commentaire")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()

      expect(screen.getAllByText("Justificatif")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()

      // vérification de la présence du bouton Envoyer
      expect(document.querySelector('button[id="btn-send-bill"]')).toBeDefined()
    })

    test("It should POST new bill",async () => {

      // On paramètre l'utilisateur et on navigue sur la page NewBill
      document.body.innerHTML=''
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      const root = document.createElement('div')
      root.setAttribute('id','root')
      document.body.appendChild(root)
      router()

      window.onNavigate(ROUTES_PATH.NewBill)
      const onNavigate = jest.fn()

      // On attends que toute la page soit chargée
      await waitFor(() => screen.getByText("Envoyer une note de frais"))

      const containerOfNewBill = new NewBill({
        document, onNavigate, store : mockedStore, localStorage: window.localStorage
      })
      
      // Un fichier .png est chargé
      const imageInput = screen.getByTestId('file')
      const file = new File(["blob"], 'fichier.png', { type: 'image/png' })
      await fireEvent.change(imageInput, {
        target: {
          files: [file]
        }
      })

      // On récupère le bouton de validation et on clic dessus
      const buttonNewBill = document.querySelector('button[id="btn-send-bill"]')
      expect(buttonNewBill).toBeDefined()
      buttonNewBill.click()
      
      // Si le formulaire validé, la page d'affichage des notes de frais devrait s'afficher
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()

      // Vérification de la navigation après validation du formulaire
      expect(containerOfNewBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])

      // Vérification que la nouvelle facture à bien été envoyée
      expect(containerOfNewBill.store.bills().update()).resolves.toEqual({
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      })
    })
  })
  
  describe("When an error occurs on API", () => {
    
    test("create bill from an API and fails with 404 message error", async () => {
      // Mock de l'erreur
      mockedStore.bills = () => {
          return {
              list: () => {
                return Promise.resolve([{
                  "id": "47qAXb6fIm2zOKkLzMro",
                  "vat": "80",
                  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                  "status": "pending",
                  "type": "Hôtel et logement",
                  "commentary": "séminaire billed",
                  "name": "encore",
                  "fileName": "preview-facture-free-201801-pdf-1.jpg",
                  "date": "2004-04-04",
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
                    "date": "2001-01-01",
                    "status": "refused",
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
                    "status": "accepted",
                    "date": "2003-03-03",
                    "commentary": "",
                    "fileName": "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
                    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3"
                  },
                  {
                    "id": "qcCK3SzECmaZAGRrHjaC",
                    "status": "refused",
                    "pct": 20,
                    "amount": 200,
                    "email": "a@a",
                    "name": "test2",
                    "vat": "40",
                    "fileName": "preview-facture-free-201801-pdf-1.jpg",
                    "date": "2002-02-02",
                    "commentAdmin": "pas la bonne facture",
                    "commentary": "test2",
                    "type": "Restaurants et bars",
                    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
                  }])
              },
              create: () => {
                return Promise.reject(new Error("Erreur 404"))
              },
              update: () => {
                return Promise.reject(new Error("Erreur 404"))
              }
          }
      }
      

      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      document.body.innerHTML=''
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement('div')
      root.setAttribute('id','root')
      document.body.appendChild(root)
      router()

      // Navigation vers la page NewBill
      window.onNavigate(ROUTES_PATH.NewBill)

      // Création de l'instance containerOfNewBill
      const onNavigate = jest.fn()
      const containerOfNewBill = new NewBill({
        document, onNavigate, store : mockedStore, localStorage: window.localStorage
      })

      // création et chargement d'un fichier .png
      const imageInput = screen.getByTestId('file')
      const file = new File(["blob"], 'fichier.png', { type: 'image/png' })
      await fireEvent.change(imageInput, {
        target: {
          files: [file]
        }
      })

      // Erreur attendu lors du chargement du fichier à l'appel de create
      expect(containerOfNewBill.store.bills().create()).rejects.toEqual(new Error("Erreur 404"))
    })

    test("create bill from an API and fails with 500 message error", async () => {
      // Mock de l'erreur
      mockedStore.bills = () => {
          return {
              list: () => {
                return Promise.resolve([{
                  "id": "47qAXb6fIm2zOKkLzMro",
                  "vat": "80",
                  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                  "status": "pending",
                  "type": "Hôtel et logement",
                  "commentary": "séminaire billed",
                  "name": "encore",
                  "fileName": "preview-facture-free-201801-pdf-1.jpg",
                  "date": "2004-04-04",
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
                    "date": "2001-01-01",
                    "status": "refused",
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
                    "status": "accepted",
                    "date": "2003-03-03",
                    "commentary": "",
                    "fileName": "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
                    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3"
                  },
                  {
                    "id": "qcCK3SzECmaZAGRrHjaC",
                    "status": "refused",
                    "pct": 20,
                    "amount": 200,
                    "email": "a@a",
                    "name": "test2",
                    "vat": "40",
                    "fileName": "preview-facture-free-201801-pdf-1.jpg",
                    "date": "2002-02-02",
                    "commentAdmin": "pas la bonne facture",
                    "commentary": "test2",
                    "type": "Restaurants et bars",
                    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
                  }])
              },
              create: () => {
                return Promise.reject(new Error("Erreur 500"))
              },
              update: () => {
                return Promise.reject(new Error("Erreur 500"))
              }
          }
      }
      

      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      document.body.innerHTML=''
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement('div')
      root.setAttribute('id','root')
      document.body.appendChild(root)
      router()

      // Navigation vers la page NewBill
      window.onNavigate(ROUTES_PATH.NewBill)

      // Création de l'instance containerOfNewBill
      const onNavigate = jest.fn()
      const containerOfNewBill = new NewBill({
        document, onNavigate, store : mockedStore, localStorage: window.localStorage
      })

      // création et chargement d'un fichier .png
      const imageInput = screen.getByTestId('file')
      const file = new File(["blob"], 'fichier.png', { type: 'image/png' })
      await fireEvent.change(imageInput, {
        target: {
          files: [file]
        }
      })

      // Erreur attendu lors du chargement du fichier à l'appel de create
      expect(containerOfNewBill.store.bills().create()).rejects.toEqual(new Error("Erreur 500"))
    })

  })

})

