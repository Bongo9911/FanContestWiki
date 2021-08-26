import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Contest, Edition, Song } from 'src/app/shared/datatypes';
import { AngularFireStorage } from '@angular/fire/storage'

@Component({
  selector: 'app-contest-screen',
  templateUrl: './contest-screen.component.html',
  styleUrls: ['./contest-screen.component.css']
})

export class ContestScreenComponent implements OnInit {

  con: Contest = {
    name: '',
    id: ''
  };
  eds: Edition[] = [];
  id: string;

  winners: Song[] = [];
  winnderEds: Edition[] = [];

  logos: string[] = []

  constructor(private database: AngularFirestore, storage: AngularFireStorage, private router: Router,
    private route: ActivatedRoute) {
    this.route.params.subscribe(params => this.id = params.id);

    this.database.firestore.collection('contests').doc(this.id)
      .get().then((doc) => {
        this.con = doc.data() as Contest;
        console.log(doc.data());
      });

    this.database.firestore.collection('contests').doc(this.id).collection('editions').get()
      .then(docs => {
        docs.forEach((doc) => {
          this.eds.push(doc.data() as Edition);
          console.log(doc.data());
        });
        this.eds.sort((a, b) => a.edval > b.edval ? 1 : -1);
        this.logos = new Array(this.eds.length);
        for (let i = 0; i < this.eds.length; ++i) {
          storage.storage.ref('contests/' + this.id + '/logos/' + this.eds[i].edition + '.png')
            .getDownloadURL().then(url => {
              this.logos[i] = url;
            })
        }
      });

    this.database.firestore.collection('contests').doc(this.id).collection('newsongs')
      .where('winner', '==', true).get().then(docs => {
        docs.forEach(doc => {
          this.winners.push(doc.data() as Song)
        })
        this.winners.sort((a, b) => a.edval > b.edval ? 1 : -1);
        this.winners.forEach(w => {
          this.winnderEds.push(this.eds.filter(ed => ed.edition == w.edition)[0])
        })
      })
  }

  ngOnInit(): void {
  }

}