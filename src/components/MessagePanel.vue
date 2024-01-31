<template>
  <div>
    <div class="header">
      <status-icon :connected="user.connected" />{{ user.username }}
    </div>

    <ul class="messages">
      <li v-for="(message, index) in user.messages" :key="index" class="message">
        <div v-if="displaySender(message, index)" class="sender">
          {{ message.fromSelf ? "(yourself)" : user.username }}
        </div>
        <!-- if statement if message has text, image and file -->
        <div v-if="message.content" class="content">
          {{ message.content }}
        </div>
        <div v-if="message.image" class="image">
          <!-- Use getImageSrc method to get the image source -->
          <img :src="getImageSrc(message.name)" />
        </div>
      </li>
    </ul>

    <form @submit.prevent="onSubmit" class="form">
      <textarea v-model="input" placeholder="Your message..." class="input"></textarea>
      <!-- Add file input to the form -->
      <input type="file" @change="handleFileChange" class="file-upload-input" />
      <button :disabled="!isValid" class="send-button">Send</button>
    </form>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon";

export default {
  name: "MessagePanel",
  components: {
    StatusIcon,
  },
  props: {
    user: Object,
  },
  data() {
    return {
      input: "",
      file: null, // Initialize file as null
    };
  },
  methods: {
    onSubmit() {
      this.$emit("input", this.input);
      // Emit the file data if it exists
      if (this.file) {
        this.$emit("file", {
          name: this.file.name,
          content: this.file,
        });
      }

      // Reset input and file after form submission
      this.input = "";
      this.file = null;
    },
    displaySender(message, index) {
      return index === 0 || this.user.messages[index - 1].fromSelf !== this.user.messages[index].fromSelf;
    },
    getImageSrc(imageName) {
      // Assuming imageName contains the path to the image file
      return process.env.BASE_URL + imageName;
    },
    handleFileChange(event) {
      this.file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        // Save the image in the public directory
        const base64Image = event.target.result;
        const imageBlob = this.base64ToBlob(base64Image);
        console.log(imageBlob);
        const formData = new FormData();
        // my location image in public folder

        formData.append('image', imageBlob, this.file.name);
        fetch('/upload', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((result) => {
            console.log('Success:', result);
          })
          .catch((error) => {
            console.error('Error:', error);
          });

      };
      reader.readAsDataURL(this.file);
    },
    isValid() {
      return this.input.length > 0;
    },
    base64ToBlob(base64) {
      const byteCharacters = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'image/png' }); // Adjust type as per your image type
    },
  },
};
</script>

<style scoped>
.header {
  line-height: 40px;
  padding: 10px 20px;
  border-bottom: 1px solid #dddddd;
}

.messages {
  margin: 0;
  padding: 20px;
}

.message {
  list-style: none;
}

.sender {
  font-weight: bold;
  margin-top: 5px;
}

.form {
  padding: 10px;
}

.input {
  width: 80%;
  resize: none;
  padding: 10px;
  line-height: 1.5;
  border-radius: 5px;
  border: 1px solid #000;
}

.send-button {
  vertical-align: top;
}

.image {
  margin-top: 10px; /* Atur margin atas */
}

.image img {
  width : 100px;
  height : 200px;
  height: auto; /* Biarkan tinggi gambar disesuaikan dengan lebarnya */
  border-radius: 5px; /* Tambahkan sudut bulat pada gambar */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* Tambahkan bayangan halus */
}
</style>
