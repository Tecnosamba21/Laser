package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type APICall struct{}

type Header struct {
	Name  string
	Value string
}

type FormData struct {
	Key   string
	Value string
}

func (g *APICall) APICall(
	urlStr string,
	method string,
	headers []Header,
	formData []FormData,
	isAPIKey bool,
	APIKey string,
) string {
	var body io.Reader

	if len(formData) > 0 {
		dataMap := make(map[string]string)
		for _, fd := range formData {
			if fd.Key != "" {
				dataMap[fd.Key] = fd.Value
			}
		}

		if len(dataMap) > 0 {
			jsonBytes, err := json.Marshal(dataMap)
			if err != nil {
				fmt.Println("Error on the 1 step")
				return "Error when fetching the API 1"
			}
			body = bytes.NewBuffer(jsonBytes)
		}
	}

	req, err := http.NewRequest(method, urlStr, body)
	if err != nil {
		fmt.Println("Error on the 2 step")
		return "Error when fetching the API 2"
	}

	for _, h := range headers {
		if h.Name != "" {
			req.Header.Set(h.Name, h.Value)
		}
	}

	if isAPIKey {
		req.Header.Set("Authorization", "Bearer "+APIKey)
	}

	if (method == http.MethodPost || method == http.MethodPut || method == http.MethodPatch) && req.Header.Get("Content-Type") == "" && body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error on the 3 step")
		return "Error when fetching the API 3" + err.Error()
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error on the 4 step")
		return "Error when fetching the API 4"
	}

	return string(respBody)
}
