<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <div class="container">
    <div class="logo-container">
      <img src="/aptima.svg" class="logo" alt="Vite logo" />
      <div class="logo-text">
        <h1>
          lampion 
        </h1>
        <p>
          bringing AI to your company 
        </p>
      </div>
    </div>
    <router-view class="router-view" />
  </div>
  <div class="footer">
    <div class="links">
      <router-link to="/imprint">
        imprint 
      </router-link>|<router-link to="/contact">
        contact 
      </router-link>|<router-link to="/">
        home
      </router-link>
    </div>
  </div>
</template>


<style scoped>
.container {
  border-radius: 2rem;
  background: linear-gradient(10deg, #f390f821, #43929930);
  box-shadow: 0 0 10rem 0 rgba(0, 0, 0, 0.3);
  padding: 1rem;
  max-height: calc(100% - 4rem);
  max-width: fit-content; /* Limit width to content */
  display: flex;
  flex-direction: column;
}


.logo-text {
  margin-left: 1rem;
  display: inline-block;
  text-align: left;
  vertical-align: middle;
  & h1 {
    margin: 0;
  }
  & p {
    margin: 0;
  }
}

img {
  vertical-align: middle;
}

.logo {
  margin-right: 0.5rem;
  height: 8rem;
  padding: 0rem;
  will-change: filter;
  transition: filter 300ms;
}

.router-view {
  flex: 1;
  overflow: hidden; /* Contain child scrolling */
  min-height: 0; /* Important for Firefox flex scrolling */
}

.footer {
  height: 2rem; /* Fixed height instead of line-height */
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}
</style>
