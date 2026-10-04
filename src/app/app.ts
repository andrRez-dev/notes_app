import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Note } from './note.model';

@Component({
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
  ],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('notes_app');

  userForm = new FormGroup({
    title: new FormControl(''),
    text: new FormControl('')
  });
  rawData = localStorage.getItem("notes");

  notes_list: Note[] = (this.rawData && this.rawData.trim() != '') ? JSON.parse(this.rawData) : [];

  onSubmit(){
    let newNote: Note = {
      title: this.userForm.value.title? this.userForm.value.title : '',
      text: this.userForm.value.text? this.userForm.value.text : ''
    }
    const rawData = localStorage.getItem("notes"); 
    this.notes_list = (rawData && rawData.trim() != '') ? JSON.parse(rawData) : [];
    this.notes_list.push(newNote);
    localStorage.setItem("notes", JSON.stringify(this.notes_list));
  }

  toggleDelete(title: string){
    this.notes_list = this.notes_list.filter(note => note.title !== title);
    localStorage.setItem("notes", JSON.stringify(this.notes_list));
  }
}
