<template>
  <div class="animate">
    <slot></slot>
    <p>{{tweeningValue}}</p>
  </div>
</template>
<script>
export default {
  name: "animatedInteger",
  props: {
    value: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tweeningValue: 0
    };
  },
  methods: {
    tween(startValue, endValue) {
      var vm = this;
      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      new TWEEN.Tween({ tweeningValue: startValue })
        .to({ tweeningValue: endValue }, 500)
        .onUpdate(function() {
          vm.tweeningValue = this.tweeningValue.toFixed(0);
        })
        .start();

      animate();
    }
  },
  
  watch: {
    value(newValue, oldValue) {
      this.tween(oldValue, newValue);
    }
  },
  mounted() {
    this.tween(0, this.value);
  }
};
</script>
<style lang="scss" scoped>
.animate {
  p {
    margin: 0;
  }
  p:last-child {
    font-size: 28px;
    font-weight: 700;
  }
}
</style>