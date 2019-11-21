<script>
  import {mapGetters} from 'vuex'
  export default {
    data() {
      return {
      }
    
    },
    created() {
     window.open('http://192.168.208.136:1234/swagger-ui.html#/')
     this.$router.push({name: '首页'})  
     //在原页面打开
     //window.location.href = 
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
    
    }
  }
</script>