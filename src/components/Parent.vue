<template lang="html">
  <div>
    <img
      style="width: 2rem; display: block;"
      src="@/assets/icon.png"
      alt="icon"
    >
    <el-link
      class="btn"
      @click="$router.push('child')"
    >
      Go to child
    </el-link>
    <router-view />
    <p>{{ getCatDetail }}</p>
  </div>
</template>

<!-- Webapp NOT recommend write css in component -->
<!-- Stylelint not support .vue file inline style -->
<style lang="scss" scoped>
.btn:hover {
  color: red;
  background: url("~@/assets/icon.png") center;
}
p {
  box-shadow: 10px 5px 5px teal;
}
</style>

<script src="./Parent.js"></script>
