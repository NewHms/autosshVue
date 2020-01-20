<template>
  <div class="app-wrapper" :class="{hideSidebar:!sidebar.opened}">
    <div>
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
import { AppMain } from '@/views/layout/components'

export default {
  name: 'Dashboard',
  components: {
    AppMain
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    }
  }
}
</script>