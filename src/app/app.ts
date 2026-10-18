import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Note } from './note.model';
import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, addDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKecCx_MEEUns4axvVU4Sr-WgMxfdtzrQ",
  authDomain: "notes-app-5beb9.firebaseapp.com",
  databaseURL: "https://notes-app-5beb9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "notes-app-5beb9",
  storageBucket: "notes-app-5beb9.firebasestorage.app",
  messagingSenderId: "37327605458",
  appId: "1:37327605458:web:cfe378b8d497e95a89e70b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const querySnapshot = await getDocs(collection(db, "notes"));

@Component({
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    FormsModule
  ],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('notes_app');
  notes_list: Note[] = [];
  editingNoteId: string | null = null;
  editTitle: string = '';
  editText: string = '';
  isNoteEditing : boolean = false;
  
  constructor(private cdr: ChangeDetectorRef) {
    this.notes_list = this.getData();
  }

  userForm = new FormGroup({
    title: new FormControl(''),
    text: new FormControl('')
  });

  getData(){
    let notes_list: Note[] = [];
    querySnapshot.forEach((doc) => {
      let note : Note = {
        id: doc.id,
        title: doc.data()['title'],
        text: doc.data()['text']
      }
      notes_list.push(note)
    })

    return notes_list;
  }
  
  startInlineEdit(note: Note) {
    if (!note.id) return;
    this.editingNoteId = note.id;
    this.editTitle = note.title;
    this.editText = note.text;
  }

  cancelInlineEdit() {
    this.editingNoteId = null;
    this.editTitle = '';
    this.editText = '';
  }

  saveInlineEdit(id : string){
    if (!id) return;

    if(!this.isNoteEditing){
      this.isNoteEditing = true;
      updateDoc(doc(db, "notes", id), {
        
        title: this.editTitle,
        text: this.editText
      }).then(() => {
        this.notes_list = this.notes_list.map(note => {
            if (note.id === id) {
              return { ...note, title: this.editTitle, text: this.editText };
            }
            return note;
          });

          this.cancelInlineEdit();
          this.cdr.detectChanges();
          this.isNoteEditing = false;
      })
    }   
  }


  async onSubmit(){
    await addDoc(collection(db, "notes"), {
      title: this.userForm.value.title? this.userForm.value.title : '',
      text: this.userForm.value.text? this.userForm.value.text : ''
    }).then((docRef) => {
      let newNote: Note = {
        id: docRef.id,
        title: this.userForm.value.title? this.userForm.value.title : '',
        text: this.userForm.value.text? this.userForm.value.text : ''
      }
      this.notes_list = [...this.notes_list, newNote];
      this.userForm.reset();
  });
  }

  toggleDelete(id: string) {
  deleteDoc(doc(db, "notes", id)).then(() => {
      this.notes_list = this.notes_list.filter(note => note.id !== id);
      localStorage.setItem("notes", JSON.stringify(this.notes_list));
      
      this.cdr.detectChanges();
    });
}
}
