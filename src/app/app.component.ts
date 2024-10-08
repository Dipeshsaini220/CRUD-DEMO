import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app';
  @ViewChild('closebutton') closebutton: any;

  submitted: boolean = false;

  addStudent!: FormGroup
  Formdata: any[] = []
  localstoragedata: any;

  selectedIds: number[] = [];
  allSelected: boolean = false;

  //Begin : image properties
  imageError!: string;
  cardImageBase64!: string;
  selectedImage: any;
  fileSizeLimit = 20 * 1024 * 1024;
  acceptedFileTypes = 'image/jpeg, image/png, image/svg+xml , video/*, application/pdf,.pdf';
  fileError: boolean = false;
  studentData: any;
  editForm: boolean = false;
  editId: any;
  // End  : image properties

  constructor(private fb: FormBuilder) {
    let studentData = localStorage.getItem('userData');
    if (studentData) {
      this.studentData = JSON.parse(studentData);
      if (this.studentData.image)
        this.selectedImage = this.studentData.image
    }
  }

  ngOnInit() {
    this.addStudent = this.fb.group({
      firstname: [''],
      lastname: [''],
      department: [''],
      email: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      country: [''],
    })
  }

  get f() {
    return this.addStudent.controls
  }

  onFileChange(event: any) {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      const file = files[0]; 
  
      // Check if the file exceeds the size limit
      if (file.size > this.fileSizeLimit) {
        return false;
      }
  
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Check if the file is an image
        if (file.type.indexOf("image") > -1) {
          this.selectedImage = { // Store only one image as an object
            url: e.target.result,
            type: 'img'
          };
        } else if (file.type.indexOf("video") > -1) {
          // Handle video case if needed
          this.selectedImage = { // Store only one video as an object
            url: e.target.result,
            type: 'video'
          };
        } else if (file.type.indexOf("application/pdf") > -1) {
          // Handle PDF case if needed
          this.selectedImage = { // Store only the PDF file name
            url: file.name,
            type: 'fileName'
          };
        }
      };
  
      // Read the file as a data URL
      reader.readAsDataURL(file);
    }
  
    return false;
  }
  

  removeImage() {
    this.selectedImage = null; 
  }


  onSubmit() {
    this.submitted = true;
  
    if (this.selectedImage.length == 0) {
      this.fileError = true;
    } else {
      this.fileError = false;
    }
  
    if (this.addStudent.invalid || this.fileError) {
      return;
    }
  
    let requestBody: any;
  
    // Get stored data from localStorage
    let storedData = localStorage.getItem('userData');
    let existingData = storedData ? JSON.parse(storedData) : [];
  
    if (this.editForm) {
      // Edit existing data
      const index = existingData.findIndex((data: any) => data.Id === this.editId);
      if (index !== -1) {
        // Update the specific item in the existingData array
        existingData[index] = {
          Id: this.editId,
          firstname: this.f['firstname'].value,
          lastname: this.f['lastname'].value,
          department: this.f['department'].value,
          email: this.f['email'].value,
          country: this.f['country'].value,
          image: this.selectedImage,
        };
      }
    } else {
      // Add new data
      requestBody = {
        Id: new Date().getTime(),
        firstname: this.f['firstname'].value,
        lastname: this.f['lastname'].value,
        department: this.f['department'].value,
        email: this.f['email'].value,
        country: this.f['country'].value,
        image: this.selectedImage,
      };
  
      existingData.push(requestBody);
    }
  
    // Save updated data to localStorage
    localStorage.setItem('userData', JSON.stringify(existingData));
  
    // Close modal and reset the form
    this.closebutton.nativeElement.click();
    this.addStudent.reset();
    this.selectedImage = [];
  
    location.reload();
  }

  deleteData(index: any) {
    const result = confirm('Want to delete?');
    if (result) {

      const studentRecords = localStorage.getItem("userData")

      let recordsArray

      if (studentRecords) {
        recordsArray = JSON.parse(studentRecords)
      }

      const updateRecords = recordsArray.filter((record: any) => record.Id !== index);

      localStorage.setItem("userData", JSON.stringify(updateRecords));

      location.reload()
    }
  }

  editData(studentData: any) {
    this.editForm = true;
    this.editId = studentData.Id
    this.selectedImage = studentData.image
    this.f['firstname'].setValue(studentData.firstname)
    this.f['lastname'].setValue(studentData.lastname)
    this.f['department'].setValue(studentData.department)
    this.f['email'].setValue(studentData.email)
    this.f['country'].setValue(studentData.country)
  }

  toggleSelectValue(id: number, event: any) {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    }

    this.allSelected = this.selectedIds.length === this.studentData.length;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  // Select or deselect all items
  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.studentData.map((item:any) => item.Id);
    } else {
      this.selectedIds = [];
    }

    this.allSelected = event.target.checked;
  }

  // Delete selected items
  deleteSelected() {
    this.studentData = this.studentData.filter((item:any) => !this.selectedIds.includes(item.Id));
    this.selectedIds = [];
    this.allSelected = false;
    
    localStorage.setItem("userData", JSON.stringify(this.studentData));
  }

  Cancel(){
    this.selectedImage = null
    this.f['firstname'].setValue('')
    this.f['lastname'].setValue('')
    this.f['department'].setValue('')
    this.f['email'].setValue('')
    this.f['country'].setValue('')
  }
 
}
