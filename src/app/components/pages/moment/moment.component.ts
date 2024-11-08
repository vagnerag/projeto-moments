import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Moment } from 'src/app/Moment';
import { Comment } from 'src/app/Comment';
import { MomentService } from 'src/app/services/moment.service';
import { CommentService } from 'src/app/services/comment.service';
import { environment } from 'src/environments/environment.development';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
  selector: 'app-moment',
  templateUrl: './moment.component.html',
  styleUrls: ['./moment.component.css'],
})
export class MomentComponent {
  baseApiUrl = environment.baseApiUrl;
  moment?: Moment;

  faTimes = faTimes;
  faEdit = faEdit;

  commentForm!: FormGroup;

  constructor(
    private momentService: MomentService,
    private route: ActivatedRoute,
    private messagesService: MessagesService,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // id que está na url
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.momentService
      .getMoment(id)
      .subscribe((item) => (this.moment = item.data));

    this.commentForm = new FormGroup({
      text: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
    });
  }

  get text() {
    return this.commentForm.get('text')!;
  }

  get username() {
    return this.commentForm.get('username')!;
  }

  removeHandler(id: number) {
    this.momentService.removeMoment(id).subscribe({
      next: () => {
        this.messagesService.add('Momento excluído com sucesso!');
        this.router.navigate(['/']);
      },
    });
  }

  async onSubmit(formDirictive: FormGroupDirective) {
    if (this.commentForm.invalid) {
      return;
    }
    const data: Comment = this.commentForm.value;
    data.momentId = Number(this.moment!.id);

    await this.commentService.createComment(data).subscribe({
      next: (comment) => {
        this.moment!.comments!.push(comment.data);
        this.messagesService.add('Comentário adicionado!');

        // reseta o form
        this.commentForm.reset();
        formDirictive.resetForm();
      },
    });
  }
}
