package logger

import (
	"go.uber.org/zap"
)

var Log *zap.SugaredLogger

func Init(isProduction bool) {
	var l *zap.Logger
	if isProduction {
		cfg := zap.NewDevelopmentConfig()
		cfg.DisableCaller = true
		cfg.EncoderConfig.ConsoleSeparator = "  "
		l, _ = cfg.Build()
	} else {
		l, _ = zap.NewDevelopment()
	}
	Log = l.Sugar()
}
